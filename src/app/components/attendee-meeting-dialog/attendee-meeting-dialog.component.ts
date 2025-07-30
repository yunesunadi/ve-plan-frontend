import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MeetingService } from '../../services/meeting.service';
import { concatMap, map, tap } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { ParticipantService } from '../../services/participant.service';
import { CommonService } from '../../services/common.service';

@Component({
  standalone: false,
  selector: 'app-attendee-meeting-dialog',
  templateUrl: './attendee-meeting-dialog.component.html',
  styleUrl: './attendee-meeting-dialog.component.scss'
})
export class AttendeeMeetingDialogComponent {
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
    this.meetingService.getOneByEventId(this.dialog_data.event_id).pipe(
      map((res) => res.data.room_name),
      concatMap((room_name) => this.meetingService.createToken(false).pipe(
        tap(() => {
          this.room_name.set(room_name);
        }),
        map((data) => ({ room_name, token: data.token }))
      )),
    ).subscribe({
      next: (data) => {
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
    this.participantService.create({
      event: this.dialog_data.event_id,
      room_name: this.room_name(),
      start_time: new Date().toISOString(),
    }).subscribe({
      next: () => {
        this.commonService.openSnackBar("Join meeting successfully.");
      }
    });
  }

  handleVideoConferenceLeft = async (participant: MeetingParticipant) => {
    this.participantService.update(this.dialog_data.event_id, { end_time: new Date().toISOString() })
      .subscribe({
        next: () => {
          this.commonService.openSnackBar("Leave meeting successfully.");
        }
      });
  }

}
