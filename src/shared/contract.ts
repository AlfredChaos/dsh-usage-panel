// dsh-usage-panel · wire contract between the host half and the browser half.
// SINGLE SOURCE OF TRUTH: both sides import from here; never hand-write the
// payload shape twice. Day keys are UTC (YYYY-MM-DD) — see README for the
// timezone declaration.

// dsh ≥0.1.5 transport: all browser traffic shares the /api prefix route
// (Host/Origin fence + browser auth). The host registers an exact fetch
// route; the client reaches it through the shared '/api' RPC channel.
export const RPC_CHANNEL = '/api'
export const RPC_OVERVIEW = 'usage-stats/overview'
export const RPC_PATH = '/api/usage-stats/overview'

/** Machine-readable error codes — the host never returns human prose. */
export type ErrorCode = 'internal' | 'bad-request' | 'scan-failed' | 'service-unavailable'

export interface RpcError {
  code: ErrorCode
  message: string
  details: Record<string, unknown>
}

export type RpcResult<T> = { ok: true; value: T } | { ok: false; error: RpcError }

/**
 * Four disjoint token buckets, per DSH's TokenUsage contract:
 * `input` is UNCACHED input only; billed input = input + cacheRead + cacheWrite.
 */
export interface Buckets {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export interface UsageTotals extends Buckets {
  total: number
}

/** One model's aggregate (v0.1.0 wire shape preserved). */
export interface ModelItem {
  model: string
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  total: number
}

/** Per-day per-model buckets, keyed by UTC day key. */
export type DayModels = Record<string, UsageTotals>

/** One heatmap day (v0.1.0 wire shape preserved). */
export interface DayRecord {
  date: string
  total: number
  models: DayModels
}

export type AggregationMode = 'projection' | 'scan' | 'none'

/**
 * Honest coverage diagnostics: the overview never claims to be a complete
 * bill when part of the corpus could not be scanned. `sessionsPending` =
 * sessions with no persisted log yet (live, mid-turn). `from`/`to` bound the
 * earliest/latest counted event time; `mode` says which data path produced
 * the payload.
 */
export interface CoverageStats {
  mode: AggregationMode
  timezone: 'UTC'
  sessionsTotal: number
  sessionsOk: number
  sessionsFailed: number
  sessionsPending: number
  eventsCounted: number
  retries: number
  compactionTokens: number
  from: number | null
  to: number | null
  /** Sessions with counted usage, split by delegation depth: 0 = main/root
   *  session, >=1 = subagent session (each subagent session counts as one). */
  usageSessionsMain: number
  usageSessionsSubagent: number
}

/** One session in the drill-down ranking (top-N by all-time total). */
export interface SessionSummary {
  id: string
  title: string | null
  totals: UsageTotals
  lastActive: number
  /** Delegation depth from the session header: 0 = main, >=1 = subagent. */
  depth: number
}

/** One provider route seen in the logs (name resolved via llm.listProviders). */
export interface ProviderItem {
  id: string
  name: string
  totals: UsageTotals
}

/** Full overview payload served by RPC /usage-stats → overview. */
export interface Overview {
  /** 182 UTC days ending today; per-day per-model totals (heatmap window). */
  days: DayRecord[]
  /** Recent-30d totals (v0.1.0 semantic). */
  totals: UsageTotals
  /** Distinct sessions with usage in the recent-30d window (v0.1.0 semantic). */
  sessionCount: number
  /** Recent-30d per-model ranking, sorted by total desc (v0.1.0 semantic). */
  byModel: ModelItem[]
  allTime: {
    totals: UsageTotals
    sessionCount: number
    byModel: ModelItem[]
  }
  coverage: CoverageStats
  /** Top-N sessions by all-time total, with folded titles. */
  topSessions: SessionSummary[]
  /** Provider routes seen in the logs (plus configured routes), by total desc. */
  providers: ProviderItem[]
  updatedAt: number
  /** Set when the payload came from a stale cache while a rescan runs. */
  stale?: boolean
}

export const OVERVIEW_VERSION = 3
