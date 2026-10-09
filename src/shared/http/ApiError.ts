/**
 * offline / timeout: no answer, keep the data in the queue and retry later.
 * auth: wrong X-API-Key. client: the backend rejected the data. server: the backend failed.
 */
export type ApiErrorKind = 'offline' | 'timeout' | 'auth' | 'client' | 'server';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Worth retrying later without changing anything. */
  get isTemporary(): boolean {
    return this.kind === 'offline' || this.kind === 'timeout' || this.kind === 'server';
  }

  /** The backend answers every error as {"detalle": "..."}. */
  static async fromResponse(response: Response): Promise<ApiError> {
    const detail = await response
      .json()
      .then((body: { detalle?: string }) => body.detalle)
      .catch(() => undefined);
    if (response.status === 401 || response.status === 403) {
      return new ApiError('auth', 'La clave del servidor no es correcta (revisa Ajustes)', response.status);
    }
    const kind = response.status >= 500 ? 'server' : 'client';
    return new ApiError(kind, detail ?? `Error ${response.status} del servidor`, response.status);
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Error inesperado';
}
