import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { combineLatest } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-meeting-started-dialog',
  templateUrl: './meeting-started-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './meeting-started-dialog.component.scss',
  imports: [CdkScrollable, MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, EmptyStateComponent],
})
export class MeetingStartedDialogComponent {
  dialog_data = inject<Array<{ user_id: string; name: string; event_id: string; type: string }>>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);

  protected readonly sending = signal(false);

  send(): void {
    this.sending.set(true);
    const registeredIds = this.dialog_data.filter((i) => i.type === 'register_approved').map((i) => i.user_id);
    const invitedIds = this.dialog_data.filter((i) => i.type === 'invitation_approved').map((i) => i.user_id);

    combineLatest([
      this.eventRegisterService.startMeeting(registeredIds, this.dialog_data[0].event_id),
      this.eventInviteService.startMeeting(invitedIds, this.dialog_data[0].event_id),
    ]).subscribe({
      error: () => {
        this.sending.set(false);
        this.dialog.close();
        this.commonService.error('Failed to send meeting email.');
      },
      complete: () => {
        this.dialog.close(true);
        this.commonService.success(
          `Meeting email sent to ${this.dialog_data.length} attendee${this.dialog_data.length === 1 ? '' : 's'}.`,
        );
      },
    });
  }
}
