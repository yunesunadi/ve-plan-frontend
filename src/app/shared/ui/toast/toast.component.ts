import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export interface ToastData {
  message: string;
  severity: ToastSeverity;
  action?: string;
}

const SEVERITY_ICON: Record<ToastSeverity, string> = {
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"toast toast--" + data.severity' },
  imports: [MatIcon, MatIconButton, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
})
export class ToastComponent {
  protected readonly data: ToastData = inject(MAT_SNACK_BAR_DATA);
  private readonly ref = inject(MatSnackBarRef<ToastComponent>);

  protected readonly icon = SEVERITY_ICON[this.data.severity];

  protected runAction(): void {
    this.ref.dismissWithAction();
  }

  protected dismiss(): void {
    this.ref.dismiss();
  }
}
