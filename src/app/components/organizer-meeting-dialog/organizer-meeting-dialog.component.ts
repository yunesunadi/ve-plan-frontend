import { Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { concatMap, delay, map, tap } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { CommonService } from '../../services/common.service';
import { ParticipantService } from '../../services/participant.service';
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
  private participantService = inject(ParticipantService);
  private dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);

  api: any;
  room_name = signal("");
  is_ending = signal(false);

  ngOnDestroy() {
    if (this.api) {
      this.api.dispose();
    }
  }

  ngAfterViewInit(): void {
    this.meetingService.getOneById(this.dialog_data.event_id).pipe(
      map((res) => res.data)
    ).subscribe({
      next: (data) => {
        this.room_name.set(data.room_name);
        this.api = this.meetingService.createJitsiMeeting(data, this.jitsi_iframe, true);

        this.api.addEventListeners({
          readyToClose: this.handleClose,
          videoConferenceJoined: this.handleVideoConferenceJoined,
          videoConferenceLeft: this.handleVideoConferenceLeft,
        });

        if (this.dialog_data.is_expired) {
          const isConfirmed = confirm("Can't join this meeting since meeting token is expired.");
          if (isConfirmed) {
            this.dialog.close();
            this.api.dispose();
          }
        }
      }
    });
  }

  leaveAndEnd() {
    const isConfirmed = confirm("Leaving will end the meeting for everyone. Attendees will no longer be able to join. Continue?");

    if (!isConfirmed) return;

    this.endMeetingAndReload();
  }

  handleClose = () => {
    // Fallback exit path (kick / error): still end the meeting for everyone.
    this.endMeetingAndReload();
  }

  handleVideoConferenceJoined = async (participant: MeetingParticipant) => {
    this.meetingService.updateStartTime(this.dialog_data.event_id, { start_time: new Date().toISOString() })
      .subscribe({
        next: () => {
          this.commonService.openSnackBar("Start meeting successfully.");
        }
      });
  }

  handleVideoConferenceLeft = async (participant: MeetingParticipant) => {
    this.endMeetingAndReload();
  }

  private endMeetingAndReload() {
    if (this.is_ending()) return;
    this.is_ending.set(true);

    this.meetingService.end(this.dialog_data.event_id).pipe(
      concatMap(() => this.meetingService.updateEndTime(this.dialog_data.event_id, { end_time: new Date().toISOString() })),
      concatMap(() => this.participantService.updateNoEndTime(this.dialog_data.event_id)),
      tap(() => {
        this.commonService.openSnackBar("Meeting ended.");
      }),
      delay(1500)
    ).subscribe({
      next: () => {
        window.location.reload();
      }
    });
  }
}
