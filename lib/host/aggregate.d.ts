import type { Buckets, CoverageStats, DayRecord, Overview, UsageTotals } from '../shared/contract.ts';
import { type UsagePanelState } from './projection.ts';
export interface SessionAgg {
    id: string;
    totals: UsageTotals;
    lastActive: number;
    depth: number;
}
export interface Aggregate {
    allTimeTotals: UsageTotals;
    allTimeByModel: Record<string, Buckets>;
    allTimeByProvider: Record<string, Buckets>;
    byDay: Record<string, Record<string, Buckets>>;
    recentTotals: UsageTotals;
    recentByModel: Record<string, Buckets>;
    recentSessionCount: number;
    allTimeSessionCount: number;
    retries: number;
    compactionTokens: number;
    from: number | null;
    to: number | null;
    usageSessionsMain: number;
    usageSessionsSubagent: number;
    sessions: SessionAgg[];
}
export declare function emptyAggregate(): Aggregate;
/**
 * Merge one session's projection value into the aggregate (pure).
 *
 * `inheritedEventCount` is the durable fork boundary (the snapshot's
 * inheritedEventCount, or header.seedLength on older formats): epochs closed
 * at or before it are the inherited prefix and are dropped; resume epochs
 * (markers without a seed) are kept whole. `depth` is
 * header.delegationDepth ?? 0 — session counts only include main sessions
 * (what the user sees in the session list); subagent usage still feeds the
 * token aggregates and the coverage split.
 */
export declare function mergeSessionValue(a: Aggregate, value: UsagePanelState, sessionId: string, now: number, depth?: number, inheritedEventCount?: number, archived?: boolean): Aggregate;
export declare function rankSessions(sessions: SessionAgg[], limit: number): SessionAgg[];
export interface FinalizeInput {
    aggregate: Aggregate;
    now: number;
    mode: CoverageStats['mode'];
    sessionsTotal: number;
    sessionsOk: number;
    sessionsFailed: number;
    sessionsPending: number;
    eventsCounted: number;
    titles: Map<string, string | null>;
    providerNames: Record<string, string>;
}
/** Build the wire Overview from an aggregate (both scan modes converge here). */
export declare function finalizeOverview(input: FinalizeInput): Overview;
export declare function emptyOverview(now: number): Overview;
export declare const HEAT_DAYS_UTC = 182;
export type { DayRecord };
