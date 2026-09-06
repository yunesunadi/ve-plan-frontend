import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ApiError, ApiErrorKind } from '../../../models/ApiError';

const KIND_ICON: Partial<Record<ApiErrorKind, string>> = {
  network: 'wifi_off',
  server: 'error_outline',
  notFound: 'search_off',
  forbidden: 'lock',
};
const DEFAULT_ICON = 'error_outline';

const GENERIC_HEADLINE = 'Something went wrong';
const KIND_HEADLINE: Partial<Record<ApiErrorKind, string>> = {
  network: "You're offline",
  server: GENERIC_HEADLINE,
  notFound: 'Not found',
  forbidden: "You don't have access to this",
};

export const DEFAULT_SUPPORTING = 'Please try again in a moment.';
export const KIND_SUPPORTING: Partial<Record<ApiErrorKind, string>> = {
  network: 'Check your connection and try again.',
  server: 'Our servers hit a snag while handling that request.',
  notFound: "This page or resource doesn't exist, or may have been removed.",
  forbidden: "You don't have permission to view this.",
};

const RETRY_HIDDEN_KINDS: ReadonlySet<ApiErrorKind> = new Set(['forbidden', 'notFound']);

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './error-state.component.scss',
  imports: [MatIcon, MatButton, MatIconButton, MatTooltip, CdkCopyToClipboard],
})
export class ErrorStateComponent {
  error = input.required<ApiError | null>();
  compact = input<boolean, unknown>(false, { transform: booleanAttribute });
  retryLabel = input<string>('Try again');

  retry = output<void>();

  protected readonly kind = computed<ApiErrorKind>(() => this.error()?.kind ?? 'unknown');
  protected readonly userActionable = computed(() => this.error()?.userActionable ?? false);

  protected readonly icon = computed(() => KIND_ICON[this.kind()] ?? DEFAULT_ICON);

  protected readonly headline = computed(() =>
    this.userActionable() ? GENERIC_HEADLINE : (KIND_HEADLINE[this.kind()] ?? GENERIC_HEADLINE),
  );

  protected readonly supporting = computed(() => {
    const err = this.error();
    if (this.userActionable() && err) return err.message;
    return KIND_SUPPORTING[this.kind()] ?? DEFAULT_SUPPORTING;
  });

  protected readonly requestId = computed(() => this.error()?.requestId ?? '');
  protected readonly showRequestId = computed(() => !this.userActionable() && !!this.requestId());

  protected readonly showRetry = computed(() => !RETRY_HIDDEN_KINDS.has(this.kind()));
}
