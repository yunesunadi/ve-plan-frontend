import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { concatMap, delay, map, tap } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { CommonService } from '../../services/common.service';
import { ParticipantService } from '../../services/participant.service';

@Component({
  standalone: false,
  selector: 'app-organizer-meeting-dialog',
  templateUrl: './organizer-meeting-dialog.component.html',
  styleUrl: './organizer-meeting-dialog.component.scss'
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
        this.api = this.meetingService.createJitsiMeeting(data, this.jitsi_iframe);

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

  handleClose = () => {
    this.api.dispose();
    this.dialog.close();
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
    this.meetingService.updateEndTime(this.dialog_data.event_id, { end_time: new Date().toISOString() }).pipe(
      concatMap(() => this.participantService.updateNoEndTime(this.dialog_data.event_id)),
      tap(() => {
        this.commonService.openSnackBar("End meeting successfully.");
      }),
      delay(1500)
    ).subscribe({
        next: () => {
          window.location.reload();
        }
      });
  }
}
