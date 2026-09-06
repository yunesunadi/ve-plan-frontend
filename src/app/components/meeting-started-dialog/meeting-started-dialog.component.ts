import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CommonService } from '../../services/common.service';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { combineLatest } from 'rxjs';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
    selector: 'app-meeting-started-dialog',
    templateUrl: './meeting-started-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './meeting-started-dialog.component.scss',
    imports: [CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, EmptyStateComponent]
})
export class MeetingStartedDialogComponent {
  dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);

  constructor() {}

  send() {
    const registered_user_id_list = this.dialog_data.filter((item: any) => item.type === "register_approved").map((item: any) => item.user_id);
    const invited_user_id_list = this.dialog_data.filter((item: any) => item.type === "invitation_approved").map((item: any) => item.user_id);

    combineLatest([
      this.eventRegisterService.startMeeting(registered_user_id_list, this.dialog_data[0].event_id),
      this.eventInviteService.startMeeting(invited_user_id_list, this.dialog_data[0].event_id)
    ]).subscribe({
      error: (err) => {
        console.log(err);

        this.dialog.close();
        this.commonService.error("Failed to send meeting email.");
      },
      complete: () => {
        this.dialog.close(true);
        this.commonService.success("Send meeting email successfully.");
      }
    });
  }
}
