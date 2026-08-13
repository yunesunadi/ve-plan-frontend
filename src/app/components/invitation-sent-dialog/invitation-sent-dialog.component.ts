import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CommonService } from '../../services/common.service';
import { EventInviteService } from '../../services/event-invite.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-invitation-sent-dialog',
    templateUrl: './invitation-sent-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invitation-sent-dialog.component.scss',
    imports: [CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose]
})
export class InvitationSentDialogComponent {
  dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private eventInviteService = inject(EventInviteService);

  constructor() {}

  send() {
    const user_id_list = this.dialog_data.map((item: any) => item.user_id);
    this.eventInviteService.invite(user_id_list, this.dialog_data[0].event_id).subscribe({
      error: (err) => {
        this.dialog.close();

        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      },
      complete: () => {
        this.dialog.close(true);
        this.commonService.openSnackBar("Send invitation successfully.");
      }
    });
  }
}
