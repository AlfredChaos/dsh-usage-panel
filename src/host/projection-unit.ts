// dsh-usage-panel · projection unit registered against ctx.sessionProjections.
// The unit is pure: init/apply/view with plain-JSON state and a stateVersion
// that invalidates persisted checkpoint rows when fold semantics change.
// Since dsh 0.1.5 the definition's init receives the durable seed boundary
// (header + inheritedEventCount), so the unit presets seedEnd exactly like
// the scan path — seed usage never reaches an epoch on either path.
import type { SessionLogOffset } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { USAGE_PANEL_KEY, applyEvent, initState, usagePanelSchema, type UsagePanelState } from './projection.ts'

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    /** Per-session usage accounting state (plain JSON). */
    usagePanel: UsagePanelState
  }
  interface SessionProjectionMap {
    /** The host reads whole states back via snapshot values. */
    usagePanel: UsagePanelState
  }
}

export const PROJECTION_STATE_VERSION = 2

export const usagePanelProjectionDefinition: Omit<ProjectionDefinition<typeof USAGE_PANEL_KEY, UsagePanelState>, 'wire'> & {
  wire: NonNullable<ProjectionDefinition<typeof USAGE_PANEL_KEY, UsagePanelState>['wire']>
} = {
  key: USAGE_PANEL_KEY,
  stateSchema: usagePanelSchema,
  init: (_header, inheritedEventCount: SessionLogOffset) => ({
    ...initState(),
    seedEnd: inheritedEventCount > 0 ? Number(inheritedEventCount) + 1 : null,
  }),
  apply: applyEvent,
  wire: {
    viewSchema: usagePanelSchema,
    view: (state) => state,
  },
  stateVersion: PROJECTION_STATE_VERSION,
}
