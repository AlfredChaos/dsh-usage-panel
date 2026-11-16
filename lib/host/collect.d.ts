import type { SessionId } from '@deepseek-ai/dsh-session';
import type { SessionRecord } from '@deepseek-ai/dsh-session-query';
import type { UsagePanelState } from './projection.ts';
/** What one session read yields for the aggregate. */
export interface SessionRead {
    /** The folded usage state, or undefined when the cell is not folded yet. */
    value: UsagePanelState | undefined;
    inheritedEventCount: number;
    /** The folded title when the host projects one; undefined when it doesn't. */
    title?: string | null;
}
/** One persistence listing: the change token of every stored session. */
export interface RevisionListing {
    /** The persistence instance the revisions belong to. */
    identity: unknown;
    revisions: ReadonlyMap<string, string>;
}
export interface CollectorDeps {
    listSessions(): Promise<readonly SessionRecord[]>;
    /** Undefined when the host has no persistence service to list. */
    listRevisions(): Promise<RevisionListing | undefined>;
    readSession(id: SessionId, live: boolean): Promise<SessionRead>;
}
export type SessionOutcome = {
    kind: 'ok';
    record: SessionRecord;
    read: SessionRead & {
        value: UsagePanelState;
    };
} | {
    kind: 'pending';
    record: SessionRecord;
} | {
    kind: 'failed';
    record: SessionRecord | undefined;
    error: string;
};
export interface CollectPass {
    outcomes: SessionOutcome[];
    /** Sessions actually read this pass (the rest came from the memo). */
    reads: number;
}
export declare function createSessionCollector(deps: CollectorDeps): () => Promise<CollectPass>;
