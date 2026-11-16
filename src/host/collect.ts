// dsh-usage-panel · per-pass session collection for the projection path.
//
// A full cold read of a session log is the expensive part of a scan, and on a
// large corpus most logs never change between keep-warm passes. The collector
// lists persistence once per pass, keeps each session's last read keyed by the
// log's persistence revision, and reads again only the sessions whose revision
// moved (plus live sessions, which have no stable revision and are cheap to
// observe). Revisions are only comparable within one persistence instance, so
// the memo is keyed by that instance's identity too.
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { SessionRecord } from '@deepseek-ai/dsh-session-query'
import type { UsagePanelState } from './projection.ts'

/** What one session read yields for the aggregate. */
export interface SessionRead {
  /** The folded usage state, or undefined when the cell is not folded yet. */
  value: UsagePanelState | undefined
  inheritedEventCount: number
  /** The folded title when the host projects one; undefined when it doesn't. */
  title?: string | null
}

/** One persistence listing: the change token of every stored session. */
export interface RevisionListing {
  /** The persistence instance the revisions belong to. */
  identity: unknown
  revisions: ReadonlyMap<string, string>
}

export interface CollectorDeps {
  listSessions(): Promise<readonly SessionRecord[]>
  /** Undefined when the host has no persistence service to list. */
  listRevisions(): Promise<RevisionListing | undefined>
  readSession(id: SessionId, live: boolean): Promise<SessionRead>
}

export type SessionOutcome =
  | { kind: 'ok'; record: SessionRecord; read: SessionRead & { value: UsagePanelState } }
  | { kind: 'pending'; record: SessionRecord }
  | { kind: 'failed'; record: SessionRecord | undefined; error: string }

export interface CollectPass {
  outcomes: SessionOutcome[]
  /** Sessions actually read this pass (the rest came from the memo). */
  reads: number
}

type Settled = { ok: true; read: SessionRead } | { ok: false; error: string }

interface MemoEntry {
  identity: unknown
  revision: string
  settled: Settled
}

/** A read failure that will repeat until the log changes (corrupt or unreplayable). */
function isDeterministicFailure(err: unknown): boolean {
  return (err as { code?: unknown } | null)?.code === 'SESSION_QUERY_CORRUPT_SESSION'
}

function errorText(err: unknown): string {
  return String((err as Error)?.message ?? err)
}

function outcomeOf(record: SessionRecord, settled: Settled): SessionOutcome {
  if (!settled.ok) return { kind: 'failed', record, error: settled.error }
  const { read } = settled
  if (!read.value) return { kind: 'pending', record }
  return { kind: 'ok', record, read: { ...read, value: read.value } }
}

export function createSessionCollector(deps: CollectorDeps): () => Promise<CollectPass> {
  let memo = new Map<string, MemoEntry>()

  return async function collect(): Promise<CollectPass> {
    const records = await deps.listSessions()
    let listing: RevisionListing | undefined
    try {
      listing = await deps.listRevisions()
    } catch {
      listing = undefined // no revisions this pass: read everything, keep no memo
    }

    const next = new Map<string, MemoEntry>()
    const outcomes: SessionOutcome[] = []
    let reads = 0
    for (const record of records) {
      const header = record && record.header
      if (!header) {
        outcomes.push({ kind: 'failed', record, error: 'session record has no header' })
        continue
      }
      if (!record.persisted) {
        outcomes.push({ kind: 'pending', record })
        continue
      }
      const id = String(header.id)
      const revision = record.live || !listing ? undefined : listing.revisions.get(id)
      const prior = memo.get(id)
      if (revision !== undefined && prior && prior.identity === listing!.identity && prior.revision === revision) {
        next.set(id, prior)
        outcomes.push(outcomeOf(record, prior.settled))
        continue
      }

      reads += 1
      let settled: Settled
      let remember = revision !== undefined
      try {
        settled = { ok: true, read: await deps.readSession(header.id, record.live) }
      } catch (err) {
        settled = { ok: false, error: errorText(err) }
        remember &&= isDeterministicFailure(err)
      }
      if (remember) next.set(id, { identity: listing!.identity, revision: revision!, settled })
      outcomes.push(outcomeOf(record, settled))
    }
    memo = next
    return { outcomes, reads }
  }
}
