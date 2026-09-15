// dsh-usage-panel · Host face (web plugin entry).
//
// Data path: the sessionProjections persisted projection is the primary
// source — every session's events are folded incrementally by the framework
// (four disjoint buckets, fork dedup, stream/retry/compaction semantics) and
// checkpoints are durable; scans aggregate cold snapshots, so a restart or
// keep-warm pass costs ~zero replay. When the projection services are
// unavailable the plugin fails soft to the v0.1.0 full rescan (same reducer).
//
// Reads are served with stale-while-revalidate: fresh for 10 minutes; older
// payloads return instantly with `stale: true` while a background rescan
// refreshes; the refresh button forces a synchronous scan. Read-only.
import type { Context } from '@deepseek-ai/cordis'
import type { SessionQueryEngine, SessionRecord } from '@deepseek-ai/dsh-session-query'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection'
import type { SessionProjectionCache } from '@deepseek-ai/dsh-session-projection-cache'
import { RPC_OVERVIEW, RPC_PATH, type CoverageStats, type Overview, type RpcResult } from '../shared/contract.ts'
import { emptyAggregate, emptyOverview, finalizeOverview, mergeSessionValue, rankSessions } from './aggregate.ts'
import { usagePanelProjectionDefinition } from './projection-unit.ts'
import { scanFallback } from './scan.ts'
import type { HostConnection, HostLlm, HostWorkspaceRegistry } from './types.ts'

export const name = 'dsh-usage-panel'
export const inject = ['timer', 'connection']

const STALE_MS = 10 * 60 * 1000 // cache freshness window
const RESCAN_MS = 10 * 60 * 1000 // periodic keep-warm rescan

export function apply(ctx: Context): void {
  const tag = '[dsh-usage-panel]'
  const sq = ctx.get('sessionQuery') as SessionQueryEngine | undefined
  const registry = ctx.get('sessionProjections') as SessionProjectionRegistry | undefined
  const projCache = ctx.get('sessionProjectionCache') as SessionProjectionCache | undefined
  const connection = ctx.get('connection') as HostConnection | undefined
  const llm = ctx.get('llm') as HostLlm | undefined
  // workspaceRegistry is lazily activated: declaring it via ctx.inject spawns
  // a child fiber that runs once the service is provided (it may only appear
  // after the API controllers wake). Until then the archive set stays empty.
  let workspaceRegistry: HostWorkspaceRegistry | undefined
  let markRegistryReady: () => void = () => { }
  const registryReady = new Promise<void>((resolve) => {
    markRegistryReady = resolve
  })
  ctx.inject(['workspaceRegistry'], (regCtx) => {
    workspaceRegistry = (regCtx as unknown as { workspaceRegistry?: HostWorkspaceRegistry }).workspaceRegistry
    console.log(tag, 'workspaceRegistry resolved: archivedSessionIds=' + (workspaceRegistry?.archivedSessionIds.length ?? 0))
    markRegistryReady()
  })
  // The first scan races that lazy activation: wait until the inject callback
  // has actually run (the Fiber promise itself settles early, on creation),
  // bounded so absent profiles never block the overview.
  let registryWaited = false
  async function awaitRegistryOnce(): Promise<void> {
    if (registryWaited) return
    registryWaited = true
    await Promise.race([registryReady, new Promise((r) => setTimeout(r, 1500))])
  }

  let mode: CoverageStats['mode'] =
    registry && projCache && sq ? 'projection' : sq ? 'scan' : 'none'

  console.log(
    tag,
    'boot: mode=' + mode,
    'services: sessionQuery=' + Boolean(sq) + ' sessionProjections=' + Boolean(registry) + ' sessionProjectionCache=' + Boolean(projCache),
  )

  // Registration is an effect on this fiber: the unit's key disappears when
  // the plugin unloads. Fail-soft: any registration problem drops to scan.
  let disposeUnit: (() => void) | null = null
  if (mode === 'projection') {
    try {
      disposeUnit = registry!.register(usagePanelProjectionDefinition)
    } catch (err) {
      console.warn(tag, 'projection registration failed; falling back to full scan:', String((err as Error)?.message ?? err))
      disposeUnit = null
      mode = 'scan'
    }
  }

  let providerNames: Record<string, string> = {}
  if (llm && typeof llm.listProviders === 'function') {
    Promise.resolve(llm.listProviders())
      .then((infos) => {
        providerNames = Object.fromEntries((infos || []).map((p) => [p.id, p.name]))
      })
      .catch((err) => console.warn(tag, 'listProviders failed:', String((err as Error)?.message ?? err)))
  }

  let cache: { at: number; payload: Overview } | null = null
  let inflight: Promise<Overview> | null = null
  let disposed = false

  function logFailure(message: string): void {
    console.warn(tag, message)
  }

  // Archive state can change between scans — rebuild the set per pass so a
  // just-archived session drops out of the KPI on the next overview.
  function archivedSet(): Set<string> {
    return new Set((workspaceRegistry?.archivedSessionIds ?? []).map(String))
  }

  async function scanProjection(now: number): Promise<Overview> {
    let a = emptyAggregate()
    const archived = archivedSet()
    let sessionsTotal = 0
    let sessionsOk = 0
    let sessionsFailed = 0
    let sessionsPending = 0
    const failures: string[] = []
    let sessions: SessionRecord[] = []
    try {
      sessions = await sq!.listSessions()
    } catch (err) {
      logFailure('listSessions failed: ' + String((err as Error)?.message ?? err))
      return emptyOverview(now)
    }
    for (const rec of sessions) {
      const header = rec && rec.header
      if (!header) {
        sessionsTotal += 1
        sessionsFailed += 1
        continue
      }
      const id = header.id
      sessionsTotal += 1
      if (!rec.persisted) {
        sessionsPending += 1
        continue
      }
      try {
        // dsh ≥0.1.5: coldSnapshot takes the caller-supplied complete log
        // (meta + inheritedEventCount + events) — read it via sessionQuery.
        const snap = await sq!.readSession(id)
        const projected = projCache!.coldSnapshot(snap.session, snap.inheritedEventCount, snap.events)
        const value = projected.values.usagePanel
        if (!value) {
          sessionsPending += 1 // cell not folded yet (no events / cold)
          continue
        }
        const depth = Number((header as { delegationDepth?: unknown }).delegationDepth) || 0
        const inherited = Number(snap.inheritedEventCount) || 0
        a = mergeSessionValue(a, value, id, now, depth, inherited, archived.has(String(id)))
        sessionsOk += 1
      } catch (err) {
        sessionsFailed += 1
        if (failures.length < 3) failures.push(String((err as Error)?.message ?? err))
      }
    }
    if (failures.length > 0) {
      logFailure(sessionsFailed + ' session(s) failed to read (first ' + failures.length + '): ' + failures.join(' | '))
    }
    const titles = new Map<string, string | null>()
    await Promise.all(
      rankSessions(a.sessions, 10).map(async (s) => {
        try {
          const t = await sq!.readTitle(s.id as SessionId)
          titles.set(s.id, t ? t.title : null)
        } catch {
          titles.set(s.id, null)
        }
      }),
    )
    return finalizeOverview({
      aggregate: a,
      now,
      mode: 'projection',
      sessionsTotal,
      sessionsOk,
      sessionsFailed,
      sessionsPending,
      eventsCounted: 0,
      titles,
      providerNames,
    })
  }

  async function scan(now: number): Promise<Overview> {
    if (disposed) return cache ? cache.payload : emptyOverview(now)
    if (mode === 'none') {
      console.log(tag, 'sessionQuery unavailable; returning empty overview')
      return emptyOverview(now)
    }
    await awaitRegistryOnce()
    if (mode === 'projection') return scanProjection(now)
    return scanFallback({ sq: sq!, providerNames, logFailure, isArchived: (id) => archivedSet().has(id) }, now)
  }

  function startScan(): Promise<Overview> {
    if (disposed) return Promise.resolve(cache ? cache.payload : emptyOverview(Date.now()))
    if (inflight) return inflight
    const run = scan(Date.now()).then((payload) => {
      if (!disposed) cache = { at: Date.now(), payload }
      return payload
    })
    inflight = run
    run.catch(() => { }).then(() => {
      if (inflight === run) inflight = null
    })
    return run
  }

  function overview(args: { force?: boolean } | undefined): Promise<Overview> {
    const force = !!(args && args.force)
    if (!force && cache) {
      if (Date.now() - cache.at < STALE_MS) return Promise.resolve(cache.payload)
      startScan() // stale-while-revalidate: background refresh
      return Promise.resolve(Object.assign({}, cache.payload, { stale: true }))
    }
    return startScan()
  }

  // RPC endpoint for the browser half: POST /api/usage-stats/overview on the
  // shared /api transport (Host/Origin fence + browser auth applied by the
  // connection plugin's route). The connection envelope (client-request /
  // server-response, rpcId echo) is what the client's rpc.call expects.
  const disposeRpc =
    connection &&
    connection.fetch.register({
      path: RPC_PATH,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: async (request) => {
        const message = (await request.json().catch(() => undefined)) as
          | { type?: unknown; rpcId?: unknown; method?: unknown; payload?: unknown }
          | undefined
        if (!message || message.type !== 'client-request' || typeof message.rpcId !== 'string') {
          return new Response('bad request', { status: 400 })
        }
        const respond = (result: RpcResult<Overview>) =>
          Response.json({ type: 'server-response', rpcId: message.rpcId, result })
        if (message.method !== RPC_OVERVIEW) {
          return respond({
            ok: false,
            error: { code: 'bad-request', message: 'unknown endpoint: ' + String(message.method), details: { issues: [] } },
          })
        }
        return respond(
          await overview(message.payload as { force?: boolean } | undefined).then(
            (value): RpcResult<Overview> => ({ ok: true, value }),
            (err): RpcResult<Overview> => ({
              ok: false,
              error: { code: 'internal', message: String((err as Error)?.message ?? err), details: {} },
            }),
          ),
        )
      },
    })

  // Warm up the moment the plugin loads.
  startScan().then((o) => {
    console.log(
      tag,
      'first scan done:',
      'mode=' + o.coverage.mode,
      'sessions=' + o.coverage.sessionsTotal + '/' + o.coverage.sessionsOk + ' (failed ' + o.coverage.sessionsFailed + ', pending ' + o.coverage.sessionsPending + ')',
      'withUsage=' + o.allTime.sessionCount,
      'dataRange=' + (o.coverage.from === null ? '-' : new Date(o.coverage.from).toISOString()) + '..' + (o.coverage.to === null ? '-' : new Date(o.coverage.to).toISOString()),
    )
  })

  // Keep-warm: light periodic rescan so the cached payload never goes stale.
  const stopTimer = ctx.interval(() => {
    if (!inflight) startScan()
  }, RESCAN_MS)

  ctx.effect(() => () => {
    disposed = true
    if (disposeUnit) disposeUnit()
    if (stopTimer) stopTimer()
    if (disposeRpc) disposeRpc()
  })
}
