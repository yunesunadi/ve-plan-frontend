import { Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { filter } from 'rxjs';
import { ApiError } from '../../models/ApiError';
import { MeetingService } from '../../services/meeting.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-organizer-meeting-dialog',
    templateUrl: './organizer-meeting-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './organizer-meeting-dialog.component.scss',
    imports: [CdkScrollable, MatDialogContent, MatButton]
})
export class OrganizerMeetingDialogComponent {
  @ViewChild("jitsi_iframe") jitsi_iframe!: ElementRef;

  private meetingService = inject(MeetingService);
  private dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);

  api: any;
  room_name = signal("");
  is_ending = signal(false);
  end_error = signal("");

  ngOnDestroy() {
    if (this.api) {
      this.api.dispose();
    }
  }

  ngAfterViewInit(): void {
    void this.initMeeting();
  }

  private async initMeeting(): Promise<void> {
    this.meetingService.createToken(this.dialog_data.event_id).subscribe({
      next: async (res) => {
        try {
          this.room_name.set(res.room_name);
          this.api = await this.meetingService.createJitsiMeeting(
            { room_name: res.room_name, token: res.token },
            this.jitsi_iframe,
            true
          );

          this.api.addEventListeners({
            readyToClose: this.handleClose,
            videoConferenceJoined: this.handleVideoConferenceJoined,
            videoConferenceLeft: this.handleVideoConferenceLeft,
          });
        } catch {
          this.commonService.error("The meeting failed to load. Please try again.");
          this.dialog.close();
        }
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
        this.dialog.close();
      }
    });
  }

  leaveAndEnd() {
    this.confirmService.confirm({
      title: "End the meeting for everyone?",
      body: "Leaving will end the meeting for everyone. Attendees will no longer be able to join.",
      confirmLabel: "End meeting",
      destructive: true,
    }).pipe(
      filter(Boolean)
    ).subscribe(() => this.endMeeting());
  }

  handleClose = () => {
    // Fallback exit path (kick / error): still end the meeting for everyone.
    this.endMeeting();
  }

  handleVideoConferenceJoined = async (_participant: MeetingParticipant) => {
    this.meetingService.updateStartTime(this.dialog_data.event_id).subscribe({
      next: () => {
        this.commonService.success("Start meeting successfully.");
      }
    });
  }

  handleVideoConferenceLeft = async (_participant: MeetingParticipant) => {
    this.endMeeting();
  }

  private endMeeting() {
    if (this.is_ending()) return;
    this.is_ending.set(true);
    this.end_error.set("");

    this.meetingService.end(this.dialog_data.event_id).subscribe({
      next: () => {
        if (this.api) {
          this.api.dispose();
          this.api = null;
        }
        this.commonService.success("Meeting ended.");
        this.dialog.close(true);
      },
      error: (err) => {
        this.is_ending.set(false);
        const message = err instanceof ApiError && err.message
          ? err.message
          : "Couldn't end the meeting. Please try again.";
        this.end_error.set(message);
        this.commonService.error(message);
      }
    });
  }
}
