import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailService } from '../../services/email.service';
import { CommonService } from '../../services/common.service';
import { EventInviteService } from '../../services/event-invite.service';
import { concatMap, mergeMap, of } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-invitation-sent-dialog',
  templateUrl: './invitation-sent-dialog.component.html',
  styleUrl: './invitation-sent-dialog.component.scss'
})
export class InvitationSentDialogComponent {
  dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private emailService = inject(EmailService);
  private commonService = inject(CommonService);
  private eventInviteService = inject(EventInviteService);

  constructor() {}

  send() {
    of(...this.dialog_data).pipe(
      mergeMap(
        (item: any) => this.emailService.send("invitation_sent", item.email, item.name, item.event_title).pipe(
          concatMap(() => this.eventInviteService.invite(item.user_id, item.event_id))
        )
      )
    ).subscribe({
      error: () => {
        this.dialog.close();
        this.commonService.openSnackBar("Failed to send invitation.");
      },
      complete: () => {
        this.dialog.close(true);
        this.commonService.openSnackBar("Send invitation successfully.");
      }
    });
  }
}
