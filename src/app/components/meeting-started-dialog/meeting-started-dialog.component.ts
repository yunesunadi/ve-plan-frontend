import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailService } from '../../services/email.service';
import { CommonService } from '../../services/common.service';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { concatMap, EMPTY, iif, mergeMap, of } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-meeting-started-dialog',
  templateUrl: './meeting-started-dialog.component.html',
  styleUrl: './meeting-started-dialog.component.scss'
})
export class MeetingStartedDialogComponent {
  dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private emailService = inject(EmailService);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);

  constructor() {}

  send() {
    of(...this.dialog_data).pipe(
      concatMap((item: any) => 
        this.emailService.send("meeting_started", item.email, item.name, item.event_title).pipe(
          concatMap(() => iif(
            () => item.type === "registered",
            this.eventRegisterService.startMeeting(item.user_id, item.event_id),
            this.eventInviteService.startMeeting(item.user_id, item.event_id)
          ))
        )
      )
    ).subscribe({
      error: (err) => {
        console.log(err);
        
        this.dialog.close();
        this.commonService.openSnackBar("Failed to send meeting email.");
      },
      complete: () => {
        this.dialog.close(true);
        this.commonService.openSnackBar("Send meeting email successfully.");
      }
    });
  }
}
