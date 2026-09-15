import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
import { USAGE_PANEL_KEY, type UsagePanelState } from './projection.ts';
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionStateMap {
        /** Per-session usage accounting state (plain JSON). */
        usagePanel: UsagePanelState;
    }
    interface SessionProjectionMap {
        /** The host reads whole states back via snapshot values. */
        usagePanel: UsagePanelState;
    }
}
export declare const PROJECTION_STATE_VERSION = 2;
export declare const usagePanelProjectionDefinition: Omit<ProjectionDefinition<typeof USAGE_PANEL_KEY, UsagePanelState>, 'wire'> & {
    wire: NonNullable<ProjectionDefinition<typeof USAGE_PANEL_KEY, UsagePanelState>['wire']>;
};
