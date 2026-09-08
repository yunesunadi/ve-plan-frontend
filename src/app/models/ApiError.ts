import { HttpErrorResponse } from '@angular/common/http';

export type ApiErrorKind =
  | 'network' | 'validation' | 'auth' | 'forbidden'
  | 'notFound' | 'conflict' | 'gone' | 'rateLimited' | 'server' | 'unknown';

const GENERIC_MESSAGES: Partial<Record<ApiErrorKind, string>> = {
  network: 'You appear to be offline.',
  server: 'Something went wrong.',
};

export interface FieldError {
  field: string;
  message: string;
}

function parseFieldErrors(body: unknown): FieldError[] {
  const raw = (body as { error?: unknown } | null)?.error;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((e): e is { value?: unknown; msg?: unknown } => !!e && typeof e === 'object')
    .map((e) => ({
      field: typeof e.value === 'string' ? e.value : '',
      message: typeof e.msg === 'string' ? e.msg : '',
    }))
    .filter((e) => e.message.length > 0);
}

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
  readonly fieldErrors: FieldError[]; // per-field validation failures, when present
  readonly userActionable: boolean; // true for 4xx with a server message safe to show verbatim
  readonly raw: HttpErrorResponse;

  constructor(raw: HttpErrorResponse) {
    const status = raw.status;
    const kind = kindFromStatus(status);
    const fieldErrors = parseFieldErrors(raw.error);

    // Prefer the specific field-level reason(s) over the generic
    // "Validation error" envelope message the backend sends alongside them.
    const fieldMessage = [...new Set(fieldErrors.map((e) => e.message))].join(' ');
    const serverMessage = raw.error?.message;
    const hasFieldMessage = fieldMessage.length > 0;
    const hasServerMessage = typeof serverMessage === 'string' && serverMessage.length > 0;
    const message = hasFieldMessage
      ? fieldMessage
      : hasServerMessage
        ? serverMessage
        : (GENERIC_MESSAGES[kind] ?? 'Something went wrong.');

    super(message);

    this.status = status;
    this.kind = kind;
    this.requestId = raw.error?.data?.requestId;
    this.data = raw.error?.data;
    this.fieldErrors = fieldErrors;
    this.userActionable = status >= 400 && status < 500 && (hasFieldMessage || hasServerMessage);
    this.raw = raw;
    this.name = 'ApiError';
  }
}
