import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiError } from '../models/ApiError';

const POST_WINDOW_MS = 60_000;
const MAX_POSTS_PER_WINDOW = 5;
const DEDUPE_MS = 5_000;

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private postTimestamps: number[] = [];
  private lastSignature = '';
  private lastSignatureAt = 0;

  handleError(error: unknown): void {
    console.error(error);

    if (error instanceof ApiError) return;

    try {
      this.report(error);
    } catch {
      /* never let the error handler throw */
    }
  }

  private report(error: unknown): void {
    const err = error as { message?: string; stack?: string } | null;
    const message = err?.message ?? String(error);
    const stack = err?.stack;

    const now = Date.now();
    const signature = `${message}::${stack?.slice(0, 200) ?? ''}`;
    if (signature === this.lastSignature && now - this.lastSignatureAt < DEDUPE_MS) return;
    this.lastSignature = signature;
    this.lastSignatureAt = now;

    this.postTimestamps = this.postTimestamps.filter((t) => now - t < POST_WINDOW_MS);
    if (this.postTimestamps.length >= MAX_POSTS_PER_WINDOW) return;
    this.postTimestamps.push(now);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let token: string | null = null;
    try {
      token = localStorage.getItem('token');
    } catch {
      /* storage unavailable */
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;

    void fetch(`${environment.apiUrl}/client_errors`, {
      method: 'POST',
      headers,
      keepalive: true,
      body: JSON.stringify({
        message: String(message).slice(0, 2000),
        stack: stack ? String(stack).slice(0, 8000) : undefined,
        url: location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      /* swallow — reporting failure must not surface */
    });
  }
}
