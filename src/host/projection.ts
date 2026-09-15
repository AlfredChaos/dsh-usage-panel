// dsh-usage-panel · per-session persisted projection (the accounting core).
//
// Registered via ctx.sessionProjections.register() so DSH folds one event per
// committed session event and checkpoints the state durably (write-behind by
// sessionProjectionCache, cold-read ladder by restore/coldSnapshot). The
// reducer is a pure function over plain-JSON state — fully unit-testable and
// replay-safe across stateVersion bumps.
//
// Accounting rules (all deliberate, see iteration-strategy §4.6):
//  - Four DISJOINT buckets per DSH TokenUsage: input is uncached only.
//  - Epoch accounting: the log is segmented by session/end-seed markers into
//    epochs (one per resume/fork boundary). Every usage event lands in the
//    epoch open at its seq; the fork-dedup decision is deferred to merge
//    time, which knows header.seedLength — the only authoritative seed
//    boundary. A marker delimits RESUME epochs too (the constructor appends
//    one whenever a seed is supplied, including self-restore), so it can
//    never gate counting inside the unit.
//  - seedEnd (nullable) is a CALLER-PRESET authoritative boundary for the
//    scan path, which owns the header: events with seq < seedEnd never reach
//    any epoch. The unit itself never assigns it — registry folds leave it
//    null and rely on merge-time epoch selection.
//  - Model attribution: request/context.model base, request/header.config.model
//    overrides (v0.1.0 semantic); provider tracked the same way.
//  - Per-step replacement: assistant/chunk provisional usage accumulates per
//    (turn:step); the step's assistant/message REPLACES it (authoritative), so
//    a retried same-step message cannot double-count (v0.1.0 bug, fixed).
//    Commit happens at step/end (or the next step's first event / turn/end).
//  - llm/retry events are counted as retries, never as token usage.
//  - compaction/summary usage is attributed to its own model AND tracked in
//    compactionTokens (visible, never mixed silently into regular output).
//  - reasoningTokens are already inside outputTokens — never added again.
//  - Day keys are UTC.
import { z } from 'zod'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { dayKeyUTC } from '../shared/usage.ts'

const bucketSchema = z.object({
  input: z.number(),
  output: z.number(),
  cacheRead: z.number(),
  cacheWrite: z.number(),
})

const stepSchema = z.object({
  buckets: bucketSchema,
  lastTime: z.number(),
  model: z.string(),
  provider: z.string(),
  mode: z.enum(['provisional', 'authoritative']),
})

const epochSchema = z.object({
  totals: bucketSchema,
  byModel: z.record(z.string(), bucketSchema),
  byDay: z.record(z.string(), z.record(z.string(), bucketSchema)),
  byProvider: z.record(z.string(), bucketSchema),
  retries: z.number(),
  compactionTokens: z.number(),
  firstTime: z.number().nullable(),
  lastTime: z.number().nullable(),
  // Seq of the session/end-seed marker that closed this epoch; null = open.
  end: z.number().nullable(),
})

export const usagePanelSchema = z.object({
  // Closed epochs in marker order, then the still-open accumulator.
  epochs: z.array(epochSchema),
  current: epochSchema,
  // Caller-preset seed boundary (scan path only; see header comment).
  seedEnd: z.number().nullable(),
  currentModel: z.string(),
  currentProvider: z.string(),
  openStep: z.string().nullable(),
  steps: z.record(z.string(), stepSchema),
})

export type Buckets = z.infer<typeof bucketSchema>
export type StepState = z.infer<typeof stepSchema>
export type EpochState = z.infer<typeof epochSchema>
export type UsagePanelState = z.infer<typeof usagePanelSchema>

export const USAGE_PANEL_KEY = 'usagePanel'

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    usagePanel: UsagePanelState
  }
}

const EMPTY: Buckets = Object.freeze({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 })

export function emptyEpoch(): EpochState {
  return {
    totals: { ...EMPTY },
    byModel: {},
    byDay: {},
    byProvider: {},
    retries: 0,
    compactionTokens: 0,
    firstTime: null,
    lastTime: null,
    end: null,
  }
}

export function initState(): UsagePanelState {
  return {
    epochs: [],
    current: emptyEpoch(),
    seedEnd: null,
    currentModel: 'unknown',
    currentProvider: 'unknown',
    openStep: null,
    steps: {},
  }
}

function stepKey(turn: number, step: number): string {
  return turn + ':' + step
}

function add(a: Buckets, b: Buckets): Buckets {
  return {
    input: a.input + b.input,
    output: a.output + b.output,
    cacheRead: a.cacheRead + b.cacheRead,
    cacheWrite: a.cacheWrite + b.cacheWrite,
  }
}

function addInto(map: Record<string, Buckets>, key: string, b: Buckets): Record<string, Buckets> {
  const cur = map[key]
  return { ...map, [key]: cur ? add(cur, b) : { ...b } }
}

function addIntoDay(
  byDay: Record<string, Record<string, Buckets>>,
  day: string,
  model: string,
  b: Buckets,
): Record<string, Record<string, Buckets>> {
  const dayMap = byDay[day]
  return { ...byDay, [day]: dayMap ? addInto(dayMap, model, b) : { [model]: { ...b } } }
}

/**
 * Whether an event may be counted. Only a caller-preset seedEnd gates
 * anything (scan path, where header.seedLength is known); a registry fold
 * leaves it null and counts everything — fork dedup happens later via
 * merge-time epoch selection.
 */
function isCounted(state: UsagePanelState, event: SessionEvent): boolean {
  return state.seedEnd === null || event.seq >= state.seedEnd
}

/** Fold usage into an epoch's aggregates (pure). */
function absorbUsage(ep: EpochState, b: Buckets, model: string, provider: string, time: number): EpochState {
  const day = dayKeyUTC(time)
  return {
    ...ep,
    totals: add(ep.totals, b),
    byModel: addInto(ep.byModel, model, b),
    byDay: addIntoDay(ep.byDay, day, model, b),
    byProvider: addInto(ep.byProvider, provider, b),
    firstTime: ep.firstTime === null ? time : Math.min(ep.firstTime, time),
    lastTime: ep.lastTime === null ? time : Math.max(ep.lastTime, time),
  }
}

/** Fold one step's buckets into the open epoch (pure; call once per step). */
function commitStep(state: UsagePanelState, key: string): UsagePanelState {
  const step = state.steps[key]
  if (!step) return state
  const steps = { ...state.steps }
  delete steps[key]
  const openStep = state.openStep === key ? null : state.openStep
  const b = step.buckets
  if (b.input === 0 && b.output === 0 && b.cacheRead === 0 && b.cacheWrite === 0) {
    // Zero usage still folds nothing; drop the step bookkeeping only.
    return { ...state, steps, openStep }
  }
  return {
    ...state,
    current: absorbUsage(state.current, b, step.model, step.provider, step.lastTime),
    steps,
    openStep,
  }
}

function commitOpenStep(state: UsagePanelState, incomingKey: string): UsagePanelState {
  if (state.openStep !== null && state.openStep !== incomingKey) {
    return commitStep(state, state.openStep)
  }
  return state
}

/**
 * Pure transition: previous state + one committed session event → next state.
 * Returns the SAME reference for unrelated events (zero downstream work, per
 * the registry contract). State is plain JSON (persisted-cache precondition).
 */
export function applyEvent(state: UsagePanelState, event: SessionEvent): UsagePanelState {
  // Logs written before dsh 0.1.5 may carry streamed chunks; the current
  // event vocabulary dropped the type, so it is matched by string. The
  // provisional usage accumulates into the step and is replaced by the
  // authoritative assistant/message at commit.
  if ((event.type as string) === 'assistant/chunk') {
    if (!isCounted(state, event)) return state
    const data = event.data as {
      turn: number
      step: number
      chunk?: { type?: string; usage?: { inputTokens?: number; outputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number } }
    }
    const chunk = data.chunk
    if (!chunk || chunk.type !== 'usage' || !chunk.usage) return state
    const key = stepKey(data.turn, data.step)
    const usage = chunk.usage
    const b = {
      input: Number(usage.inputTokens) || 0,
      output: Number(usage.outputTokens) || 0,
      cacheRead: Number(usage.cacheReadTokens) || 0,
      cacheWrite: Number(usage.cacheWriteTokens) || 0,
    }
    let next = commitOpenStep(state, key)
    const existing = next.steps[key]
    const step: StepState = existing
      ? { ...existing, buckets: add(existing.buckets, b), lastTime: event.time }
      : {
        buckets: b,
        lastTime: event.time,
        model: next.currentModel,
        provider: next.currentProvider,
        mode: 'provisional',
      }
    return {
      ...next,
      steps: { ...next.steps, [key]: step },
      openStep: key,
    }
  }
  switch (event.type) {
    case 'session/end-seed': {
      // Every marker closes the open epoch — markers delimit resume AND fork
      // boundaries, so the unit never decides which prefix is foreign. Flush
      // an open step first so its usage lands in the epoch it started in.
      const flushed = state.openStep !== null ? commitStep(state, state.openStep) : state
      return {
        ...flushed,
        epochs: [...flushed.epochs, { ...flushed.current, end: event.seq }],
        current: emptyEpoch(),
      }
    }
    case 'request/context': {
      const { model, provider } = event.data
      if (!model && !provider) return state
      return {
        ...state,
        currentModel: model || state.currentModel,
        currentProvider: provider || state.currentProvider,
      }
    }
    case 'request/header': {
      const cfg = event.data.header && event.data.header.config
      if (!cfg || (!cfg.model && !cfg.provider)) return state
      return {
        ...state,
        currentModel: cfg.model || state.currentModel,
        currentProvider: cfg.provider || state.currentProvider,
      }
    }
    case 'assistant/attempt': {
      if (!isCounted(state, event)) return state
      // A settled failed/retried/cancelled call: a distinct billed call whose
      // preserved stream carries the usage chunks. Count every chunk (never
      // replaced — a same-step retried message is a separate call).
      let b: Buckets | null = null
      for (const rec of event.data.stream ?? []) {
        if (rec.type !== 'chunk' || rec.chunk.type !== 'usage' || !rec.chunk.usage) continue
        const u = rec.chunk.usage
        const uu = {
          input: Number(u.inputTokens) || 0,
          output: Number(u.outputTokens) || 0,
          cacheRead: Number(u.cacheReadTokens) || 0,
          cacheWrite: Number(u.cacheWriteTokens) || 0,
        }
        b = b ? add(b, uu) : uu
      }
      if (!b) return state
      return { ...state, current: absorbUsage(state.current, b, state.currentModel, state.currentProvider, event.time) }
    }
    case 'assistant/message': {
      if (!isCounted(state, event)) return state
      const usage = event.data.usage
      if (!usage) return state
      const key = stepKey(event.data.turn, event.data.step)
      const b = {
        input: Number(usage.inputTokens) || 0,
        output: Number(usage.outputTokens) || 0,
        cacheRead: Number(usage.cacheReadTokens) || 0,
        cacheWrite: Number(usage.cacheWriteTokens) || 0,
      }
      let next = commitOpenStep(state, key)
      const step: StepState = {
        buckets: b,
        lastTime: event.time,
        model: next.currentModel,
        provider: next.currentProvider,
        mode: 'authoritative',
      }
      return {
        ...next,
        steps: { ...next.steps, [key]: step },
        openStep: key,
      }
    }
    case 'step/end': {
      const key = stepKey(event.data.turn, event.data.step)
      return commitStep(state, key)
    }
    case 'turn/end': {
      // Safety net for logs that end mid-step: commit the open step.
      return state.openStep !== null ? commitStep(state, state.openStep) : state
    }
    case 'llm/retry': {
      if (!isCounted(state, event)) return state
      const cur = state.current
      return {
        ...state,
        current: {
          ...cur,
          retries: cur.retries + 1,
          firstTime: cur.firstTime === null ? event.time : Math.min(cur.firstTime, event.time),
          lastTime: cur.lastTime === null ? event.time : Math.max(cur.lastTime, event.time),
        },
      }
    }
    case 'compaction/summary': {
      if (!isCounted(state, event)) return state
      const usage = event.data.usage
      if (!usage) return state
      const b = {
        input: Number(usage.inputTokens) || 0,
        output: Number(usage.outputTokens) || 0,
        cacheRead: Number(usage.cacheReadTokens) || 0,
        cacheWrite: Number(usage.cacheWriteTokens) || 0,
      }
      const model = event.data.model || state.currentModel
      const provider = event.data.provider || state.currentProvider
      const absorbed = absorbUsage(state.current, b, model, provider, event.time)
      return {
        ...state,
        current: { ...absorbed, compactionTokens: absorbed.compactionTokens + b.input + b.output + b.cacheRead + b.cacheWrite },
      }
    }
    default:
      return state
  }
}

/**
 * Fold a full event list from init (cold read path / tests). Single pass —
 * markers split the log into epochs and every usage event lands in one; the
 * fork-dedup decision is deferred to merge time via selectEpochs.
 */
export function foldEvents(events: readonly SessionEvent[]): UsagePanelState {
  let state = initState()
  for (const event of events) state = applyEvent(state, event)
  return state
}

/**
 * The epochs whose usage belongs to THIS session, given the durable seed
 * prefix length (header.seedLength ?? 0). An epoch closed by a marker at or
 * before seedLength lies inside the inherited prefix (the fork boundary is
 * always a marker position: construction appends one at seedLength unless the
 * seed already ends with one — either way no epoch straddles the boundary).
 * Resume-only sessions have seedLength 0 → every epoch kept; marker-less
 * sessions fold into a single open epoch → kept.
 */
export function selectEpochs(value: UsagePanelState, seedLength: number): EpochState[] {
  return [...value.epochs, value.current].filter((e) => e.end === null || e.end > seedLength)
}

/** Flatten epochs into one per-session usage view (pure). */
export function flattenEpochs(epochs: readonly EpochState[]): Omit<EpochState, 'end'> {
  const out = emptyEpoch()
  for (const ep of epochs) {
    out.totals = add(out.totals, ep.totals)
    out.retries += ep.retries
    out.compactionTokens += ep.compactionTokens
    if (ep.firstTime !== null) out.firstTime = out.firstTime === null ? ep.firstTime : Math.min(out.firstTime, ep.firstTime)
    if (ep.lastTime !== null) out.lastTime = out.lastTime === null ? ep.lastTime : Math.max(out.lastTime, ep.lastTime)
    for (const model of Object.keys(ep.byModel)) out.byModel = addInto(out.byModel, model, ep.byModel[model]!)
    for (const provider of Object.keys(ep.byProvider)) out.byProvider = addInto(out.byProvider, provider, ep.byProvider[provider]!)
    for (const day of Object.keys(ep.byDay)) {
      for (const model of Object.keys(ep.byDay[day]!)) out.byDay = addIntoDay(out.byDay, day, model, ep.byDay[day]![model]!)
    }
  }
  return out
}

/** Sum day buckets across epochs whose key >= cutoffKey (recent-30d window). */
export function recentOf(epochs: readonly EpochState[], cutoffKey: string): { totals: Buckets; byModel: Record<string, Buckets> } {
  const totals: Buckets = { ...EMPTY }
  const byModel: Record<string, Buckets> = {}
  for (const ep of epochs) {
    for (const day of Object.keys(ep.byDay)) {
      if (day < cutoffKey) continue
      for (const model of Object.keys(ep.byDay[day]!)) {
        const b = ep.byDay[day]![model]!
        totals.input += b.input
        totals.output += b.output
        totals.cacheRead += b.cacheRead
        totals.cacheWrite += b.cacheWrite
        const cur = byModel[model]
        byModel[model] = cur
          ? {
            input: cur.input + b.input,
            output: cur.output + b.output,
            cacheRead: cur.cacheRead + b.cacheRead,
            cacheWrite: cur.cacheWrite + b.cacheWrite,
          }
          : { ...b }
      }
    }
  }
  return { totals, byModel }
}
