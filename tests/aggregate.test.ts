// Locks the cross-session aggregation: recent-30d window, session counts,
// top-session ranking with titles, coverage passthrough, provider rows, and
// the 182-day UTC heatmap window.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { foldEvents } from '../src/host/projection.ts'
import { emptyAggregate, finalizeOverview, mergeSessionValue, rankSessions } from '../src/host/aggregate.ts'
import { HEAT_DAYS } from '../src/shared/usage.ts'

function ev(type: string, seq: number, time: number, data: unknown): SessionEvent {
  return { type, seq, time, data } as unknown as SessionEvent
}

function usage(input = 0, output = 0, cacheRead = 0, cacheWrite = 0) {
  return { inputTokens: input, outputTokens: output, cacheReadTokens: cacheRead, cacheWriteTokens: cacheWrite }
}

function sessionLog(days: Array<{ month?: number; day: number; input: number; model?: string }>): SessionEvent[] {
  const events: SessionEvent[] = [ev('session/end-seed', 1, 0, {})]
  let seq = 2
  for (const { month, day, input, model } of days) {
    const t = Date.UTC(2026, month ?? 7, day, 12, 0, 0)
    events.push(ev('request/context', seq++, t, { provider: 'p1', model: model || 'm1' }))
    events.push(ev('assistant/message', seq++, t, { turn: 1, step: seq, usage: usage(input, input / 2) }))
    events.push(ev('step/end', seq++, t, { turn: 1, step: seq - 1 }))
  }
  return events
}

const NOW = Date.UTC(2026, 7, 15, 12, 0, 0) // 2026-08-15

test('mergeSessionValue aggregates totals, sessions and providers across sessions', () => {
  let a = emptyAggregate()
  // Session A: 100 input on 08-14 (recent) + 1000 input on 07-01 (old).
  const a1 = foldEvents(sessionLog([{ day: 14, input: 100 }, { month: 6, day: 1, input: 1000 }]))
  a = mergeSessionValue(a, a1, 'sess-a', NOW, 0)
  // Session B: 50 input on 08-15.
  const b1 = foldEvents(sessionLog([{ day: 15, input: 50, model: 'm2' }]))
  a = mergeSessionValue(a, b1, 'sess-b', NOW, 1)

  assert.equal(a.allTimeTotals.input, 1150)
  assert.equal(a.recentTotals.input, 150) // 08-14 + 08-15 only (30-day window)
  // Session counts are main-only (delegationDepth === 0); subagent usage
  // still feeds the token aggregates and the coverage split.
  assert.equal(a.recentSessionCount, 1)
  assert.equal(a.allTimeSessionCount, 1)
  assert.equal(a.allTimeByModel['m1']?.input, 1100)
  assert.equal(a.allTimeByModel['m2']?.input, 50)
  assert.equal(a.allTimeByProvider['p1']?.input, 1150)
  assert.equal(a.usageSessionsMain, 1) // sess-a is depth 0
  assert.equal(a.usageSessionsSubagent, 1) // sess-b is depth 1
  assert.equal(a.from, Date.UTC(2026, 6, 1, 12, 0, 0))
  assert.equal(a.to, Date.UTC(2026, 7, 15, 12, 0, 0))
})

test('rankSessions orders by all-time total and honors the limit', () => {
  let a = emptyAggregate()
  const big = foldEvents(sessionLog([{ day: 15, input: 500 }]))
  const small = foldEvents(sessionLog([{ day: 15, input: 10 }]))
  a = mergeSessionValue(a, big, 'big', NOW, 0)
  a = mergeSessionValue(a, small, 'small', NOW, 1)
  const top = rankSessions(a.sessions, 1)
  assert.equal(top.length, 1)
  assert.equal(top[0]!.id, 'big')
})

test('finalizeOverview builds the wire payload with coverage, titles and providers', () => {
  let a = emptyAggregate()
  a = mergeSessionValue(a, foldEvents(sessionLog([{ day: 14, input: 100 }])), 'sess-a', NOW, 0)
  a = mergeSessionValue(a, foldEvents(sessionLog([{ day: 15, input: 50, model: 'm2' }])), 'sess-b', NOW, 1)
  const titles = new Map<string, string | null>([
    ['sess-a', 'Expensive run'],
    ['sess-b', null],
  ])
  const overview = finalizeOverview({
    aggregate: a,
    now: NOW,
    mode: 'projection',
    sessionsTotal: 3,
    sessionsOk: 2,
    sessionsFailed: 1,
    sessionsPending: 0,
    eventsCounted: 0,
    titles,
    providerNames: { p1: 'DeepSeek' },
  })

  assert.equal(overview.days.length, HEAT_DAYS)
  assert.equal(overview.days[HEAT_DAYS - 1]!.date, '2026-08-15')
  assert.equal(overview.totals.input, 150)
  assert.equal(overview.sessionCount, 1)
  assert.equal(overview.allTime.sessionCount, 1)
  assert.deepEqual(
    overview.byModel.map((m) => m.model),
    ['m1', 'm2'],
  )
  assert.equal(overview.coverage.mode, 'projection')
  assert.equal(overview.coverage.timezone, 'UTC')
  assert.equal(overview.coverage.sessionsTotal, 3)
  assert.equal(overview.coverage.sessionsFailed, 1)
  assert.equal(overview.coverage.usageSessionsMain, 1)
  assert.equal(overview.coverage.usageSessionsSubagent, 1)
  assert.equal(overview.topSessions.length, 2)
  assert.equal(overview.topSessions[0]!.id, 'sess-a')
  assert.equal(overview.topSessions[0]!.depth, 0)
  assert.equal(overview.topSessions[1]!.depth, 1)
  assert.equal(overview.topSessions[0]!.title, 'Expensive run')
  assert.equal(overview.topSessions[1]!.title, null)
  assert.equal(overview.providers.length, 1)
  assert.equal(overview.providers[0]!.name, 'DeepSeek')
  assert.equal(overview.updatedAt, NOW)
})

test('mergeSessionValue drops seed-prefix epochs via seedLength, keeps resume epochs', () => {
  // Layout: [seed prefix w/ parent resume marker][fork marker][own w0][own resume][own w1]
  const events = [
    ev('assistant/message', 1, Date.UTC(2026, 7, 14), { turn: 1, step: 1, usage: usage(50) }),
    ev('step/end', 2, Date.UTC(2026, 7, 14), { turn: 1, step: 1 }),
    ev('session/end-seed', 3, Date.UTC(2026, 7, 14), {}), // parent's resume marker inside seed
    ev('assistant/message', 4, Date.UTC(2026, 7, 14), { turn: 2, step: 1, usage: usage(40) }),
    ev('step/end', 5, Date.UTC(2026, 7, 14), { turn: 2, step: 1 }),
    ev('session/end-seed', 6, Date.UTC(2026, 7, 14), {}), // fork boundary → seedLength = 6
    ev('assistant/message', 7, Date.UTC(2026, 7, 15), { turn: 3, step: 1, usage: usage(30) }),
    ev('step/end', 8, Date.UTC(2026, 7, 15), { turn: 3, step: 1 }),
    ev('session/end-seed', 9, Date.UTC(2026, 7, 15), {}), // child's own resume marker
    ev('assistant/message', 10, Date.UTC(2026, 7, 15), { turn: 4, step: 1, usage: usage(20) }),
    ev('step/end', 11, Date.UTC(2026, 7, 15), { turn: 4, step: 1 }),
  ]
  const a = mergeSessionValue(emptyAggregate(), foldEvents(events), 'sess', NOW, 0, 6)
  assert.equal(a.allTimeTotals.input, 50) // 30 + 20 own usage; 90 of prefix dropped
  assert.equal(a.allTimeSessionCount, 1)
  assert.equal(a.recentTotals.input, 50)
})

test('sessionCount mirrors the sidebar: empty mains count, archived mains do not', () => {
  let a = emptyAggregate()
  // A used main session.
  a = mergeSessionValue(a, foldEvents(sessionLog([{ day: 14, input: 100 }])), 'sess-used', NOW, 0)
  // An empty main session (created, never sent a message): sidebar-visible.
  a = mergeSessionValue(a, foldEvents([]), 'sess-empty', NOW, 0)
  // An archived session with real usage: sidebar-hidden → KPI invisible,
  // but its spend still feeds token totals and the top-session ranking.
  a = mergeSessionValue(a, foldEvents(sessionLog([{ day: 15, input: 200 }])), 'sess-archived', NOW, 0, 0, true)

  assert.equal(a.allTimeSessionCount, 2) // used + empty; archived excluded
  assert.equal(a.usageSessionsMain, 1) // archived spend is not sidebar-visible
  assert.equal(a.recentSessionCount, 1)
  assert.equal(a.allTimeTotals.input, 300) // archived tokens still aggregate
  assert.equal(a.sessions.length, 2) // topSessions ranks real spend, archived included
})

test('finalizeOverview on an empty aggregate yields a zero overview (mode none)', () => {
  const overview = finalizeOverview({
    aggregate: emptyAggregate(),
    now: NOW,
    mode: 'none',
    sessionsTotal: 0,
    sessionsOk: 0,
    sessionsFailed: 0,
    sessionsPending: 0,
    eventsCounted: 0,
    titles: new Map(),
    providerNames: {},
  })
  assert.equal(overview.totals.total, 0)
  assert.equal(overview.topSessions.length, 0)
  assert.equal(overview.providers.length, 0)
  assert.equal(overview.coverage.mode, 'none')
})
