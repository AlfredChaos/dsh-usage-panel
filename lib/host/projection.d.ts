import { z } from 'zod';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
declare const bucketSchema: z.ZodObject<{
    input: z.ZodNumber;
    output: z.ZodNumber;
    cacheRead: z.ZodNumber;
    cacheWrite: z.ZodNumber;
}, z.core.$strip>;
declare const stepSchema: z.ZodObject<{
    buckets: z.ZodObject<{
        input: z.ZodNumber;
        output: z.ZodNumber;
        cacheRead: z.ZodNumber;
        cacheWrite: z.ZodNumber;
    }, z.core.$strip>;
    lastTime: z.ZodNumber;
    model: z.ZodString;
    provider: z.ZodString;
    mode: z.ZodEnum<{
        provisional: "provisional";
        authoritative: "authoritative";
    }>;
}, z.core.$strip>;
declare const epochSchema: z.ZodObject<{
    totals: z.ZodObject<{
        input: z.ZodNumber;
        output: z.ZodNumber;
        cacheRead: z.ZodNumber;
        cacheWrite: z.ZodNumber;
    }, z.core.$strip>;
    byModel: z.ZodRecord<z.ZodString, z.ZodObject<{
        input: z.ZodNumber;
        output: z.ZodNumber;
        cacheRead: z.ZodNumber;
        cacheWrite: z.ZodNumber;
    }, z.core.$strip>>;
    byDay: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodObject<{
        input: z.ZodNumber;
        output: z.ZodNumber;
        cacheRead: z.ZodNumber;
        cacheWrite: z.ZodNumber;
    }, z.core.$strip>>>;
    byProvider: z.ZodRecord<z.ZodString, z.ZodObject<{
        input: z.ZodNumber;
        output: z.ZodNumber;
        cacheRead: z.ZodNumber;
        cacheWrite: z.ZodNumber;
    }, z.core.$strip>>;
    retries: z.ZodNumber;
    compactionTokens: z.ZodNumber;
    firstTime: z.ZodNullable<z.ZodNumber>;
    lastTime: z.ZodNullable<z.ZodNumber>;
    end: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export declare const usagePanelSchema: z.ZodObject<{
    epochs: z.ZodArray<z.ZodObject<{
        totals: z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>;
        byModel: z.ZodRecord<z.ZodString, z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>>;
        byDay: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>>>;
        byProvider: z.ZodRecord<z.ZodString, z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>>;
        retries: z.ZodNumber;
        compactionTokens: z.ZodNumber;
        firstTime: z.ZodNullable<z.ZodNumber>;
        lastTime: z.ZodNullable<z.ZodNumber>;
        end: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>>;
    current: z.ZodObject<{
        totals: z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>;
        byModel: z.ZodRecord<z.ZodString, z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>>;
        byDay: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>>>;
        byProvider: z.ZodRecord<z.ZodString, z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>>;
        retries: z.ZodNumber;
        compactionTokens: z.ZodNumber;
        firstTime: z.ZodNullable<z.ZodNumber>;
        lastTime: z.ZodNullable<z.ZodNumber>;
        end: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>;
    seedEnd: z.ZodNullable<z.ZodNumber>;
    currentModel: z.ZodString;
    currentProvider: z.ZodString;
    openStep: z.ZodNullable<z.ZodString>;
    steps: z.ZodRecord<z.ZodString, z.ZodObject<{
        buckets: z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
        }, z.core.$strip>;
        lastTime: z.ZodNumber;
        model: z.ZodString;
        provider: z.ZodString;
        mode: z.ZodEnum<{
            provisional: "provisional";
            authoritative: "authoritative";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type Buckets = z.infer<typeof bucketSchema>;
export type StepState = z.infer<typeof stepSchema>;
export type EpochState = z.infer<typeof epochSchema>;
export type UsagePanelState = z.infer<typeof usagePanelSchema>;
export declare const USAGE_PANEL_KEY = "usagePanel";
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionMap {
        usagePanel: UsagePanelState;
    }
}
export declare function emptyEpoch(): EpochState;
export declare function initState(): UsagePanelState;
/**
 * Pure transition: previous state + one committed session event → next state.
 * Returns the SAME reference for unrelated events (zero downstream work, per
 * the registry contract). State is plain JSON (persisted-cache precondition).
 */
export declare function applyEvent(state: UsagePanelState, event: SessionEvent): UsagePanelState;
/**
 * Fold a full event list from init (cold read path / tests). Single pass —
 * markers split the log into epochs and every usage event lands in one; the
 * fork-dedup decision is deferred to merge time via selectEpochs.
 */
export declare function foldEvents(events: readonly SessionEvent[]): UsagePanelState;
/**
 * The epochs whose usage belongs to THIS session, given the durable seed
 * prefix length (header.seedLength ?? 0). An epoch closed by a marker at or
 * before seedLength lies inside the inherited prefix (the fork boundary is
 * always a marker position: construction appends one at seedLength unless the
 * seed already ends with one — either way no epoch straddles the boundary).
 * Resume-only sessions have seedLength 0 → every epoch kept; marker-less
 * sessions fold into a single open epoch → kept.
 */
export declare function selectEpochs(value: UsagePanelState, seedLength: number): EpochState[];
/** Flatten epochs into one per-session usage view (pure). */
export declare function flattenEpochs(epochs: readonly EpochState[]): Omit<EpochState, 'end'>;
/** Sum day buckets across epochs whose key >= cutoffKey (recent-30d window). */
export declare function recentOf(epochs: readonly EpochState[], cutoffKey: string): {
    totals: Buckets;
    byModel: Record<string, Buckets>;
};
export {};
