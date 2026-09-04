import { Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MeetingService } from '../../services/meeting.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { CommonService } from '../../services/common.service';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-organizer-meeting-dialog',
    templateUrl: './organizer-meeting-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './organizer-meeting-dialog.component.scss',
    imports: [CdkScrollable, MatDialogContent]
})
export class OrganizerMeetingDialogComponent {
  @ViewChild("jitsi_iframe") jitsi_iframe!: ElementRef;

  private meetingService = inject(MeetingService);
  private dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);

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
          this.commonService.openSnackBar("The meeting failed to load. Please try again.");
          this.dialog.close();
        }
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
        this.dialog.close();
      }
    });
  }

  leaveAndEnd() {
    const isConfirmed = confirm("Leaving will end the meeting for everyone. Attendees will no longer be able to join. Continue?");

    if (!isConfirmed) return;

    this.endMeeting();
  }

  handleClose = () => {
    // Fallback exit path (kick / error): still end the meeting for everyone.
    this.endMeeting();
  }

  handleVideoConferenceJoined = async (_participant: MeetingParticipant) => {
    this.meetingService.updateStartTime(this.dialog_data.event_id).subscribe({
      next: () => {
        this.commonService.openSnackBar("Start meeting successfully.");
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
        this.commonService.openSnackBar("Meeting ended.");
        this.dialog.close(true);
      },
      error: (err) => {
        this.is_ending.set(false);
        const message = err instanceof HttpErrorResponse && err.error?.message
          ? err.error.message
          : "Couldn't end the meeting. Please try again.";
        this.end_error.set(message);
        this.commonService.openSnackBar(message);
      }
    });
  }
}
