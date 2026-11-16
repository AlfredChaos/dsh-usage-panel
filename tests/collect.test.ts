// Locks the per-pass collector: one listing per pass, logs re-read only when
// their persistence revision moved, live sessions always observed, and
// revisions never compared across persistence instances.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { SessionRecord } from '@deepseek-ai/dsh-session-query'
import { createSessionCollector, type RevisionListing, type SessionRead } from '../src/host/collect.ts'
import { initState } from '../src/host/projection.ts'

interface FakeSession {
  id: string
  revision: string
  live?: boolean
  persisted?: boolean
  fail?: 'corrupt' | 'transient'
  folded?: boolean
}

function harness(initial: FakeSession[]) {
  let sessions = initial
  let identity: unknown = Symbol('persistence')
  let listingAvailable = true
  let listingThrows = false
  const reads: string[] = []
  const collect = createSessionCollector({
    listSessions: async () =>
      sessions.map(
        (s) =>
          ({
            header: { id: s.id },
            live: !!s.live,
            persisted: s.persisted ?? true,
          }) as unknown as SessionRecord,
      ),
    listRevisions: async (): Promise<RevisionListing | undefined> => {
      if (listingThrows) throw new Error('listing failed')
      if (!listingAvailable) return undefined
      return { identity, revisions: new Map(sessions.filter((s) => s.persisted ?? true).map((s) => [s.id, s.revision])) }
    },
    readSession: async (id: SessionId): Promise<SessionRead> => {
      reads.push(String(id))
      const s = sessions.find((x) => x.id === id)!
      if (s.fail === 'corrupt') throw Object.assign(new Error('corrupt log'), { code: 'SESSION_QUERY_CORRUPT_SESSION' })
      if (s.fail === 'transient') throw Object.assign(new Error('EIO'), { code: 'SESSION_QUERY_PERSISTENCE_FAILED' })
      return { value: s.folded === false ? undefined : initState(), inheritedEventCount: 0, title: 'title of ' + s.id }
    },
  })
  return {
    collect,
    reads,
    set: (next: FakeSession[]) => {
      sessions = next
    },
    newPersistence: () => {
      identity = Symbol('persistence')
    },
    noListing: () => {
      listingAvailable = false
    },
    listingFails: () => {
      listingThrows = true
    },
    take: () => reads.splice(0).sort(),
  }
}

test('first pass reads every persisted log; an unchanged corpus reads none', async () => {
  const h = harness([
    { id: 'a', revision: '1' },
    { id: 'b', revision: '1' },
    { id: 'c', revision: '1' },
  ])
  const first = await h.collect()
  assert.deepEqual(h.take(), ['a', 'b', 'c'])
  assert.equal(first.reads, 3)
  const second = await h.collect()
  assert.deepEqual(h.take(), [])
  assert.equal(second.reads, 0)
  assert.deepEqual(
    second.outcomes.map((o) => o.kind),
    first.outcomes.map((o) => o.kind),
  )
  const ok = second.outcomes.find((o) => o.kind === 'ok')
  assert.equal(ok?.kind === 'ok' && ok.read.title, 'title of a')
})

test('only sessions whose revision moved are read again', async () => {
  const h = harness([
    { id: 'a', revision: '1' },
    { id: 'b', revision: '1' },
  ])
  await h.collect()
  h.take()
  h.set([
    { id: 'a', revision: '1' },
    { id: 'b', revision: '2' },
    { id: 'n', revision: '1' },
  ])
  await h.collect()
  assert.deepEqual(h.take(), ['b', 'n'])
})

test('live sessions are observed on every pass', async () => {
  const h = harness([
    { id: 'live', revision: '1', live: true },
    { id: 'cold', revision: '1' },
  ])
  await h.collect()
  h.take()
  await h.collect()
  assert.deepEqual(h.take(), ['live'])
})

test('a session that goes cold is read once at its stored revision, then memoized', async () => {
  const h = harness([{ id: 's', revision: '1', live: true }])
  await h.collect()
  h.set([{ id: 's', revision: '1' }])
  await h.collect()
  await h.collect()
  assert.deepEqual(h.take(), ['s', 's'])
})

test('revisions from another persistence instance are never trusted', async () => {
  const h = harness([{ id: 'a', revision: '1' }])
  await h.collect()
  h.take()
  h.newPersistence()
  await h.collect()
  assert.deepEqual(h.take(), ['a'])
})

test('without a revision listing every pass reads every log', async () => {
  for (const mode of ['absent', 'throws'] as const) {
    const h = harness([{ id: 'a', revision: '1' }])
    if (mode === 'absent') h.noListing()
    else h.listingFails()
    await h.collect()
    await h.collect()
    assert.deepEqual(h.take(), ['a', 'a'], mode)
  }
})

test('corrupt logs are remembered by revision; transient failures are retried', async () => {
  const h = harness([
    { id: 'bad', revision: '1', fail: 'corrupt' },
    { id: 'flaky', revision: '1', fail: 'transient' },
  ])
  const first = await h.collect()
  assert.deepEqual(
    first.outcomes.map((o) => o.kind),
    ['failed', 'failed'],
  )
  h.take()
  const second = await h.collect()
  assert.deepEqual(h.take(), ['flaky'])
  assert.deepEqual(
    second.outcomes.map((o) => o.kind),
    ['failed', 'failed'],
  )
})

test('unpersisted sessions are pending and never read; unfolded cells stay pending from the memo', async () => {
  const h = harness([
    { id: 'new', revision: '1', persisted: false },
    { id: 'empty', revision: '1', folded: false },
  ])
  const first = await h.collect()
  assert.deepEqual(h.take(), ['empty'])
  const second = await h.collect()
  assert.deepEqual(h.take(), [])
  for (const pass of [first, second]) {
    assert.deepEqual(
      pass.outcomes.map((o) => o.kind),
      ['pending', 'pending'],
    )
  }
})

test('sessions that leave the listing are dropped from the memo', async () => {
  const h = harness([{ id: 'a', revision: '1' }])
  await h.collect()
  h.set([])
  await h.collect()
  h.set([{ id: 'a', revision: '1' }])
  await h.collect()
  assert.deepEqual(h.take(), ['a', 'a'])
})
