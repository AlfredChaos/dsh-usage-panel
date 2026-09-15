// dsh-usage-panel · host-side structural types for services the plugin uses
// at runtime but whose host-side type packages are not public: the Cordis
// `connection` service (RPC) and the `llm` service (provider directory).
// The runtime shapes below are exactly what v0.1.0 already exercised.

// `ctx.interval` comes from @deepseek-ai/cordis-plugin-timer at runtime.
// The augmentation is declared locally so the built bundle has NO runtime
// import of that devDependency (consumers never install devDeps).
declare module '@deepseek-ai/cordis' {
  interface Context {
    interval(callback: () => void, delay: number): () => void
  }
}

export interface HostRpcResult<T> {
  ok: boolean
  value?: T
  error?: { code: string; message: string; details: Record<string, unknown> }
}

/** Exact-path Fetch route registered under the shared /api transport. */
export interface HostFetchRoute {
  path: string
  methods: string[]
  requestBody: 'buffered' | 'streaming'
  fetch(request: Request): Promise<Response> | Response
}

export interface HostFetchRegister {
  register(route: HostFetchRoute): () => void
}

export interface HostConnection {
  fetch: HostFetchRegister
}

export interface LlmProviderInfoLike {
  id: string
  name: string
}

export interface HostLlm {
  listProviders(): Promise<LlmProviderInfoLike[]> | LlmProviderInfoLike[]
}

/**
 * `ctx.workspaceRegistry` (optional): the sidebar's archive authority.
 * `archivedSessionIds` are SessionId-branded strings ('session-<uuid>'),
 * same form as SessionRecord.header.id.
 */
export interface HostWorkspaceRegistry {
  readonly archivedSessionIds: readonly unknown[]
}
