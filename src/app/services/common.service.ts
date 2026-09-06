import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { ApiError } from '../models/ApiError';
import { DEFAULT_SUPPORTING, KIND_SUPPORTING } from '../shared/ui/error-state/error-state.component';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  action?: string;
  onAction?: () => void;
  duration?: number | null;
}

const DEFAULT_DURATION: Record<ToastSeverity, number | undefined> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: undefined,
};

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private snackBar = inject(MatSnackBar);

  openSnackBar(msg: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.info(msg);
  }

  success(msg: string, opts?: ToastOptions): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(msg, 'success', opts);
  }

  info(msg: string, opts?: ToastOptions): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(msg, 'info', opts);
  }

  warning(msg: string, opts?: ToastOptions): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(msg, 'warning', opts);
  }

  error(err: ApiError | string, opts?: ToastOptions): MatSnackBarRef<TextOnlySnackBar> {
    const message = typeof err === 'string' ? err : this.errorMessage(err);
    return this.show(message, 'error', opts);
  }

  private errorMessage(err: ApiError): string {
    const base = err.userActionable ? err.message : (KIND_SUPPORTING[err.kind] ?? DEFAULT_SUPPORTING);
    return err.requestId ? `${base} (ref: ${err.requestId})` : base;
  }

  private show(message: string, severity: ToastSeverity, opts: ToastOptions = {}): MatSnackBarRef<TextOnlySnackBar> {
    const hasAction = !!opts.action;

    let duration: number | undefined;
    if (opts.duration === null) {
      duration = undefined;
    } else if (typeof opts.duration === 'number') {
      duration = opts.duration;
    } else if (hasAction) {
      duration = undefined;
    } else {
      duration = DEFAULT_DURATION[severity];
    }

    const config: MatSnackBarConfig = {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      politeness: severity === 'error' ? 'assertive' : 'polite',
      announcementMessage: message,
      panelClass: ['app-toast', `app-toast--${severity}`],
      duration,
    };

    const ref = this.snackBar.open(message, opts.action, config);

    if (opts.onAction) {
      ref.onAction().subscribe(() => opts.onAction?.());
    }

    return ref;
  }
}
