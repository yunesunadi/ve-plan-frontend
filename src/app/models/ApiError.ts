import { HttpErrorResponse } from '@angular/common/http';

export type ApiErrorKind =
  | 'network' | 'validation' | 'auth' | 'forbidden'
  | 'notFound' | 'conflict' | 'gone' | 'rateLimited' | 'server' | 'unknown';

const GENERIC_MESSAGES: Partial<Record<ApiErrorKind, string>> = {
  network: 'You appear to be offline.',
  server: 'Something went wrong.',
};

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 0) return 'network';
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'auth';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 409) return 'conflict';
  if (status === 410) return 'gone';
  if (status === 429) return 'rateLimited';
  if (status >= 500) return 'server';
  return 'unknown';
}

export class ApiError extends Error {
  readonly status: number;          // HTTP status; 0 for network/offline
  readonly kind: ApiErrorKind;
  readonly requestId?: string;      // backend 500s carry data.requestId
  readonly data?: unknown;          // the envelope's data, when present
  readonly userActionable: boolean; // true for 4xx with a server message safe to show verbatim
  readonly raw: HttpErrorResponse;

  constructor(raw: HttpErrorResponse) {
    const status = raw.status;
    const kind = kindFromStatus(status);
    const serverMessage = raw.error?.message;
    const hasServerMessage = typeof serverMessage === 'string' && serverMessage.length > 0;
    const message = hasServerMessage ? serverMessage : (GENERIC_MESSAGES[kind] ?? 'Something went wrong.');

    super(message);

    this.status = status;
    this.kind = kind;
    this.requestId = raw.error?.data?.requestId;
    this.data = raw.error?.data;
    this.userActionable = status >= 400 && status < 500 && hasServerMessage;
    this.raw = raw;
    this.name = 'ApiError';
  }
}
