import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatInput, MatHint } from '@angular/material/input';
import { ConfirmConfig } from '../../models/Confirm';

export const CONFIRM_DIALOG_TITLE_ID = 'confirm-dialog-title';
export const CONFIRM_DIALOG_BODY_ID = 'confirm-dialog-body';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './confirm-dialog.component.scss',
  imports: [CdkScrollable, MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatFormField, MatLabel, MatInput, MatHint],
})
export class ConfirmDialogComponent {

  protected readonly titleId = CONFIRM_DIALOG_TITLE_ID;
  protected readonly bodyId = CONFIRM_DIALOG_BODY_ID;

  protected readonly data = inject<ConfirmConfig>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);

  protected readonly typedPhrase = signal('');

  protected readonly showCancel = computed(() => this.data.cancelLabel !== null);
  protected readonly cancelLabel = computed(() => this.data.cancelLabel ?? 'Cancel');
  protected readonly confirmLabel = computed(() => this.data.confirmLabel ?? 'Confirm');
  protected readonly destructive = computed(() => !!this.data.destructive);
  protected readonly requiresPhrase = computed(() => !!this.data.confirmationPhrase);

  protected readonly confirmDisabled = computed(() => {
    if (!this.requiresPhrase()) return false;
    return this.typedPhrase().trim() !== (this.data.confirmationPhrase ?? '').trim();
  });

  onPhraseInput(event: Event) {
    this.typedPhrase.set((event.target as HTMLInputElement).value);
  }

  confirm() {
    if (this.confirmDisabled()) return;
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
