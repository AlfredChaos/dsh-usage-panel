declare module '@deepseek-ai/cordis' {
    interface Context {
        interval(callback: () => void, delay: number): () => void;
    }
}
export interface HostRpcResult<T> {
    ok: boolean;
    value?: T;
    error?: {
        code: string;
        message: string;
        details: Record<string, unknown>;
    };
}
/** Exact-path Fetch route registered under the shared /api transport. */
export interface HostFetchRoute {
    path: string;
    methods: string[];
    requestBody: 'buffered' | 'streaming';
    fetch(request: Request): Promise<Response> | Response;
}
export interface HostFetchRegister {
    register(route: HostFetchRoute): () => void;
}
export interface HostConnection {
    fetch: HostFetchRegister;
}
export interface LlmProviderInfoLike {
    id: string;
    name: string;
}
export interface HostLlm {
    listProviders(): Promise<LlmProviderInfoLike[]> | LlmProviderInfoLike[];
}
/**
 * `ctx.workspaceRegistry` (optional): the sidebar's archive authority.
 * `archivedSessionIds` are SessionId-branded strings ('session-<uuid>'),
 * same form as SessionRecord.header.id.
 */
export interface HostWorkspaceRegistry {
    readonly archivedSessionIds: readonly unknown[];
}
