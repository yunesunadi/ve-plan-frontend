import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { ConfirmConfig } from '../models/Confirm';
import { CONFIRM_DIALOG_BODY_ID, CONFIRM_DIALOG_TITLE_ID, ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private dialog = inject(MatDialog);

  confirm(config: ConfirmConfig): Observable<boolean> {
    return this.dialog.open<ConfirmDialogComponent, ConfirmConfig, boolean>(ConfirmDialogComponent, {
      data: config,
      width: '420px',
      autoFocus: 'dialog',
      disableClose: !!config.destructive,
      ariaLabelledBy: CONFIRM_DIALOG_TITLE_ID,
      ariaDescribedBy: CONFIRM_DIALOG_BODY_ID,
    }).afterClosed().pipe(
      map((result) => result === true)
    );
  }

  acknowledge(title: string, body: string, label = 'Close'): Observable<void> {
    return this.confirm({
      title,
      body,
      cancelLabel: null,
      confirmLabel: label,
    }).pipe(
      map(() => undefined)
    );
  }
}
