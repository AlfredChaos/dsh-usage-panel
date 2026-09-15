// Locks the projection reducer's accounting semantics: epoch bookkeeping
// (session/end-seed delimits resume/fork boundaries), merge-time fork dedup
// via seedLength, dual-source model attribution, per-step provisional/
// authoritative replacement (retry dedup), compaction attribution, retry
// counting, disjoint buckets, and the same-reference contract.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { applyEvent, flattenEpochs, foldEvents, initState, recentOf, selectEpochs, type UsagePanelState } from '../src/host/projection.ts'

function ev(type: string, seq: number, time: number, data: unknown): SessionEvent {
  return { type, seq, time, data } as unknown as SessionEvent
}

function usage(input = 0, output = 0, cacheRead = 0, cacheWrite = 0) {
  return { inputTokens: input, outputTokens: output, cacheReadTokens: cacheRead, cacheWriteTokens: cacheWrite }
}

/** Flatten the session's OWN usage: keep epochs outside the seed prefix. */
function flat(state: UsagePanelState, seedLength = 0): Omit<import('../src/host/projection.ts').EpochState, 'end'> {
  return flattenEpochs(selectEpochs(state, seedLength))
}

test('epoch bookkeeping: every end-seed marker closes the open epoch', () => {
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(100) }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
    ev('session/end-seed', 3, 1000, {}), // resume boundary
    ev('assistant/message', 4, 2000, { turn: 2, step: 1, usage: usage(7) }),
    ev('step/end', 5, 2000, { turn: 2, step: 1 }),
    ev('session/end-seed', 6, 2000, {}), // another resume boundary
  ]
  const state = foldEvents(events)
  assert.equal(state.epochs.length, 2)
  assert.equal(state.epochs[0]!.end, 3)
  assert.equal(state.epochs[1]!.end, 6)
  assert.equal(state.current.end, null)
  assert.equal(state.epochs[0]!.totals.input, 100)
  assert.equal(state.epochs[1]!.totals.input, 7)
})

test('resumed session (markers, no seedLength) keeps EVERY window', () => {
  // The v0.2.0 bug: markers were treated as the fork boundary, so everything
  // before the last resume vanished. Regression: all windows count.
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(100) }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
    ev('session/end-seed', 3, 1000, {}), // resume 1
    ev('assistant/message', 4, 2000, { turn: 2, step: 1, usage: usage(20) }),
    ev('step/end', 5, 2000, { turn: 2, step: 1 }),
    ev('session/end-seed', 6, 2000, {}), // resume 2
    ev('assistant/message', 7, 3000, { turn: 3, step: 1, usage: usage(3) }),
    ev('step/end', 8, 3000, { turn: 3, step: 1 }),
  ]
  const v = flat(foldEvents(events), 0)
  assert.equal(v.totals.input, 123)
})

test('session with no marker at all counts everything (fresh / blank subagent)', () => {
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(10) }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
    ev('assistant/message', 3, 2000, { turn: 1, step: 2, usage: usage(5) }),
    ev('step/end', 4, 2000, { turn: 1, step: 2 }),
  ]
  const state = foldEvents(events)
  assert.equal(state.epochs.length, 0)
  assert.equal(flat(state).totals.input, 15)
})

test('fork dedup is decided at merge time via seedLength', () => {
  // Log layout of a forked session: parent prefix + boundary marker + own work.
  const events = [
    ev('request/header', 1, 1000, { header: { config: { model: 'm' } }, reason: 'initial' }),
    ev('assistant/message', 2, 1000, { turn: 1, step: 1, usage: usage(100) }),
    ev('session/end-seed', 3, 1000, {}), // fork boundary (== seedLength)
    ev('assistant/message', 4, 2000, { turn: 2, step: 1, usage: usage(7) }),
    ev('step/end', 5, 2000, { turn: 2, step: 1 }),
  ]
  const state = foldEvents(events)
  const own = flat(state, 3)
  assert.equal(own.totals.input, 7)
  assert.equal(own.byModel['m']?.input, 7) // model context survives the boundary
  // The same log viewed without a seed prefix counts everything.
  assert.equal(flat(state, 0).totals.input, 107)
})

test('fork of a RESUMED parent still drops the whole prefix (parent markers inside seed)', () => {
  // The v0.2.0 projection bug: the parent's resume marker at seq 3 was the
  // "first" marker, so parent usage after it leaked into the child's count.
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(10) }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
    ev('session/end-seed', 3, 1000, {}), // parent's resume marker (inside seed)
    ev('assistant/message', 4, 2000, { turn: 2, step: 1, usage: usage(50) }),
    ev('step/end', 5, 2000, { turn: 2, step: 1 }),
    ev('session/end-seed', 6, 2000, {}), // fork boundary: seedLength = 6
    ev('assistant/message', 7, 3000, { turn: 3, step: 1, usage: usage(7) }),
    ev('step/end', 8, 3000, { turn: 3, step: 1 }),
  ]
  const state = foldEvents(events)
  const own = flat(state, 6)
  assert.equal(own.totals.input, 7) // only the child's own step
  assert.equal(selectEpochs(state, 6).length, 1)
})

test('child event AT seq == seedLength still counts (seed already ended with a marker)', () => {
  // Fork whose seed's last event was already a marker: no marker is appended
  // at the boundary, so the first child event sits AT seq = seedLength.
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(50) }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
    ev('session/end-seed', 3, 1000, {}), // last seed event: seedLength = 4
    ev('assistant/message', 4, 2000, { turn: 2, step: 1, usage: usage(7) }),
    ev('step/end', 5, 2000, { turn: 2, step: 1 }),
  ]
  const own = flat(foldEvents(events), 4)
  assert.equal(own.totals.input, 7)
})

test('model attribution: request/context base, request/header overrides (v0.1.0)', () => {
  const events = [
    ev('request/context', 1, 1000, { provider: 'p1', model: 'context-model' }),
    ev('assistant/message', 2, 1000, { turn: 1, step: 1, usage: usage(10) }),
    ev('request/header', 3, 1000, { header: { config: { provider: 'p1', model: 'header-model' } }, reason: 'change' }),
    ev('assistant/message', 4, 1000, { turn: 1, step: 2, usage: usage(20) }),
    ev('step/end', 5, 1000, { turn: 1, step: 2 }),
  ]
  const v = flat(foldEvents(events))
  assert.equal(v.byModel['context-model']?.input, 10)
  assert.equal(v.byModel['header-model']?.input, 20)
  assert.equal(v.byProvider['p1']?.input, 30)
})

test('chunk provisional accumulates and is replaced by the authoritative message', () => {
  const events = [
    ev('assistant/chunk', 1, 1000, { turn: 1, step: 1, chunk: { type: 'usage', usage: usage(10, 2) } }),
    ev('assistant/chunk', 2, 1000, { turn: 1, step: 1, chunk: { type: 'usage', usage: usage(5, 1) } }),
    ev('assistant/message', 3, 1000, { turn: 1, step: 1, usage: usage(100, 30) }),
    ev('step/end', 4, 1000, { turn: 1, step: 1 }),
  ]
  const v = flat(foldEvents(events))
  // Authoritative replaces the accumulated provisional: 100/30, not 115/33.
  assert.deepEqual(v.totals, { input: 100, output: 30, cacheRead: 0, cacheWrite: 0 })
})

test('same-step retried message replaces instead of double-counting (v0.1.0 bug)', () => {
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(50) }),
    ev('llm/retry', 2, 1000, { turn: 1, step: 1, retryId: 'r1', provider: 'p', mode: 'normal', policyKey: 'k', retry: 1, maxRetries: 2, delayMs: 100, failure: { code: 'x', message: 'x' } }),
    ev('assistant/message', 3, 1000, { turn: 1, step: 1, usage: usage(80) }),
    ev('step/end', 4, 1000, { turn: 1, step: 1 }),
  ]
  const v = flat(foldEvents(events))
  assert.equal(v.totals.input, 80) // 80, not 130
  assert.equal(v.retries, 1)
})

test('assistant/attempt usage counts as a distinct billed call alongside the retried message', () => {
  // 0.1.5 replaced streamed chunk events with settled attempt records; a
  // failed attempt still consumed tokens, so it counts alongside the
  // retry's authoritative message rather than replacing it.
  const events = [
    ev('assistant/attempt', 1, 1000, {
      turn: 1, step: 1, stream: [
        { type: 'chunk', time: 1, chunk: { type: 'usage', usage: { inputTokens: 50, outputTokens: 5 } } },
      ]
    }),
    ev('assistant/message', 2, 2000, { turn: 1, step: 1, usage: usage(80) }),
    ev('step/end', 3, 2000, { turn: 1, step: 1 }),
  ]
  const v = flat(foldEvents(events))
  assert.equal(v.totals.input, 130) // 50 attempt + 80 message — both billed
  assert.equal(v.totals.output, 5)
})

test('assistant/attempt without usage contributes nothing', () => {
  const events = [
    ev('assistant/attempt', 1, 1000, {
      turn: 1, step: 1, stream: [
        { type: 'chunk', time: 1, chunk: { type: 'finish', reason: 'error' } },
      ]
    }),
    ev('assistant/message', 2, 2000, { turn: 1, step: 2, usage: usage(20) }),
    ev('step/end', 3, 2000, { turn: 1, step: 2 }),
  ]
  assert.equal(flat(foldEvents(events)).totals.input, 20)
})

test('distinct steps both count (each attempt is a real billed call)', () => {
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(10) }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
    ev('assistant/message', 3, 1000, { turn: 1, step: 2, usage: usage(20) }),
    ev('step/end', 4, 1000, { turn: 1, step: 2 }),
  ]
  assert.equal(flat(foldEvents(events)).totals.input, 30)
})

test('step/end commits a provisional-only step (aborted stream still billed)', () => {
  const events = [
    ev('assistant/chunk', 1, 1000, { turn: 1, step: 1, chunk: { type: 'usage', usage: usage(9) } }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
  ]
  assert.equal(flat(foldEvents(events)).totals.input, 9)
})

test('turn/end commits the open step (log ends mid-step safety)', () => {
  const events = [
    ev('assistant/chunk', 1, 1000, { turn: 1, step: 3, chunk: { type: 'usage', usage: usage(4) } }),
    ev('turn/end', 2, 1000, { turn: 1, reason: 'success' }),
  ]
  assert.equal(flat(foldEvents(events)).totals.input, 4)
})

test('marker flushes an open step into the epoch it started in', () => {
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(50) }),
    ev('session/end-seed', 2, 1000, {}), // step 1 had no step/end; boundary flushes it
    ev('assistant/message', 3, 2000, { turn: 2, step: 1, usage: usage(7) }),
    ev('step/end', 4, 2000, { turn: 2, step: 1 }),
  ]
  const state = foldEvents(events)
  assert.equal(state.epochs[0]!.totals.input, 50)
  assert.equal(flat(state, 2).totals.input, 7)
})

test('compaction/summary usage attributed to its own model and tracked separately', () => {
  const events = [
    ev('compaction/summary', 1, 1000, { compactionId: 'c1', summary: [], shadowedRange: { start: 1, end: 2 }, shadowedSeqs: [1, 2], shadowedTokenCount: 50, provider: 'p', model: 'compactor', usage: usage(6, 1, 2, 3) }),
  ]
  const v = flat(foldEvents(events))
  assert.equal(v.byModel['compactor']?.input, 6)
  assert.equal(v.compactionTokens, 12)
  assert.equal(v.totals.input, 6)
  assert.equal(v.totals.output + v.totals.cacheRead + v.totals.cacheWrite + v.totals.input, 12)
})

test('reasoning is already inside output — never added again', () => {
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: { ...usage(10, 20), reasoningTokens: 15 } }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
  ]
  const v = flat(foldEvents(events))
  assert.equal(v.totals.output, 20)
  assert.equal(v.totals.input + v.totals.output, 30)
})

test('unrelated events return the SAME state reference (zero downstream work)', () => {
  const state = initState()
  const next = applyEvent(state, ev('user/message', 1, 1000, { content: 'hi' }))
  assert.equal(next, state)
  // Unknown event types are ignored too.
  const next2 = applyEvent(state, ev('todo/write', 2, 1000, { todos: [] }))
  assert.equal(next2, state)
})

test('request/context without model/provider is a no-op (same reference)', () => {
  const state = initState()
  const next = applyEvent(state, ev('request/context', 1, 1000, {}))
  assert.equal(next, state)
})

test('caller-preset seedEnd gates usage events (scan path boundary)', () => {
  const events = [
    ev('assistant/message', 1, 1000, { turn: 1, step: 1, usage: usage(100) }),
    ev('step/end', 2, 1000, { turn: 1, step: 1 }),
    ev('assistant/message', 3, 2000, { turn: 1, step: 2, usage: usage(7) }),
    ev('step/end', 4, 2000, { turn: 1, step: 2 }),
  ]
  let state: UsagePanelState = { ...initState(), seedEnd: 3 }
  for (const e of events) state = applyEvent(state, e)
  assert.equal(flat(state).totals.input, 7)
})

test('day buckets are UTC and per-model', () => {
  const events = [
    ev('assistant/message', 1, Date.UTC(2026, 7, 15, 23, 30), { turn: 1, step: 1, usage: usage(5) }),
    ev('step/end', 2, Date.UTC(2026, 7, 15, 23, 30), { turn: 1, step: 1 }),
  ]
  const v = flat(foldEvents(events))
  assert.ok(v.byDay['2026-08-15'])
  assert.equal(v.byDay['2026-08-15']!['unknown']!.input, 5)
})

test('recentOf sums only days >= cutoff key', () => {
  const state = foldEvents([
    ev('assistant/message', 1, Date.UTC(2026, 6, 1, 0, 0), { turn: 1, step: 1, usage: usage(100) }),
    ev('step/end', 2, Date.UTC(2026, 6, 1, 0, 0), { turn: 1, step: 1 }),
    ev('assistant/message', 3, Date.UTC(2026, 7, 14, 0, 0), { turn: 2, step: 1, usage: usage(7) }),
    ev('step/end', 4, Date.UTC(2026, 7, 14, 0, 0), { turn: 2, step: 1 }),
  ])
  const recent = recentOf(selectEpochs(state, 0), '2026-07-16')
  assert.equal(recent.totals.input, 7)
  const all = recentOf(selectEpochs(state, 0), '2026-01-01')
  assert.equal(all.totals.input, 107)
})

test('firstTime/lastTime track the counted event range per epoch', () => {
  const state = foldEvents([
    ev('assistant/message', 1, 5000, { turn: 1, step: 1, usage: usage(1) }),
    ev('step/end', 2, 5000, { turn: 1, step: 1 }),
    ev('llm/retry', 3, 9000, { turn: 1, step: 2, retryId: 'r', provider: 'p', mode: 'normal', policyKey: 'k', retry: 1, maxRetries: 1, delayMs: 1, failure: { code: 'x', message: 'x' } }),
  ])
  const v = flat(state)
  assert.equal(v.firstTime, 5000)
  assert.equal(v.lastTime, 9000)
})
