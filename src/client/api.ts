// dsh-usage-panel · RPC wrapper + localStorage SWR cache.
//
// The browser keeps the last successful overview in localStorage (versioned,
// structure-validated) so a page refresh renders instantly; a background
// refresh then updates it. A failed refresh keeps the cached payload and the
// UI shows the fallback state with the last success timestamp (never fakes
// freshness). Version bumps invalidate old caches instead of a hand-maintained
// field whitelist.
import type { RpcResultLike } from './ctx.ts'
import type { Overview } from '../shared/contract.ts'
import { OVERVIEW_VERSION, RPC_CHANNEL, RPC_OVERVIEW, type RpcResult } from '../shared/contract.ts'

const CACHE_KEY = 'dsh-usage-panel:overview:v' + OVERVIEW_VERSION

export interface CachedOverview {
  version: number
  savedAt: number
  payload: Overview
}

export function loadCached(): CachedOverview | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isUsable(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveCached(payload: Overview): void {
  try {
    const record: CachedOverview = { version: OVERVIEW_VERSION, savedAt: Date.now(), payload }
    localStorage.setItem(CACHE_KEY, JSON.stringify(record))
  } catch {
    // Storage full/blocked: the panel still works, just without persistence.
  }
}

export function clearCached(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    /* ignore */
  }
}

/** Structural validation: version match + every field the UI reads present. */
export function isUsable(value: unknown): value is CachedOverview {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (v.version !== OVERVIEW_VERSION) return false
  const payload = v.payload as Record<string, unknown> | undefined
  if (!payload || typeof payload !== 'object') return false
  if (typeof payload.updatedAt !== 'number') return false
  const totals = payload.totals as Record<string, unknown> | undefined
  if (!totals || typeof totals.input !== 'number' || typeof totals.total !== 'number') return false
  if (!Array.isArray(payload.days) || !Array.isArray(payload.byModel)) return false
  const allTime = payload.allTime as Record<string, unknown> | undefined
  if (!allTime || typeof allTime.sessionCount !== 'number') return false
  const coverage = payload.coverage as Record<string, unknown> | undefined
  if (!coverage || typeof coverage.sessionsTotal !== 'number') return false
  if (typeof coverage.usageSessionsMain !== 'number' || typeof coverage.usageSessionsSubagent !== 'number') return false
  if (!Array.isArray(payload.topSessions) || !Array.isArray(payload.providers)) return false
  return true
}

/** Call the RPC overview endpoint; rejects with the machine-readable code. */
export async function callOverview(
  rpc: { call(channel: string, endpoint: string, payload?: unknown): Promise<RpcResultLike<unknown>> },
  force: boolean,
): Promise<Overview> {
  const res = (await rpc.call(RPC_CHANNEL, RPC_OVERVIEW, { force: !!force })) as RpcResult<Overview>
  if (res && res.ok) return res.value
  const code = res && res.error ? res.error.code : 'internal'
  const message = res && res.error ? res.error.message : 'unknown error'
  const err = new Error(message) as Error & { code?: string }
  err.code = code
  throw err
}
