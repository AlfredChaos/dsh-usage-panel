import type { SessionQueryEngine } from '@deepseek-ai/dsh-session-query';
import type { Overview } from '../shared/contract.ts';
export interface ScanFallbackDeps {
    sq: SessionQueryEngine;
    providerNames: Record<string, string>;
    logFailure: (message: string) => void;
    /** Sidebar visibility: archived sessions feed totals but never the KPI. */
    isArchived: (sessionId: string) => boolean;
}
export declare function scanFallback(deps: ScanFallbackDeps, now: number): Promise<Overview>;
