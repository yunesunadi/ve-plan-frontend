import { Component, inject, ViewChild } from '@angular/core';
import { map } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { environment } from '../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

declare var JitsiMeetExternalAPI: any;

@Component({
  standalone: false,
  selector: 'app-organizer-meeting-dialog',
  templateUrl: './organizer-meeting-dialog.component.html',
  styleUrl: './organizer-meeting-dialog.component.scss'
})
export class OrganizerMeetingDialogComponent {
  @ViewChild("jitsi_iframe") jitsi_iframe: any;

  private meetingService = inject(MeetingService);
  private dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);

  options: any;
  api: any;

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
        this.options = {
          roomName: `${environment.appId}/${data.room_name}`,
          configOverwrite: {
            prejoinPageEnabled: true,
            disableInviteFunctions: true,
            disableKick: true,
          },
          interfaceConfigOverwrite: {
            startAudioMuted: true,
            startVideoMuted: true,
          },
          parentNode: this.jitsi_iframe.nativeElement,
          jwt: data.token
        };

        this.api = new JitsiMeetExternalAPI(environment.meeting_domain, this.options);

        this.api.addEventListeners({
          readyToClose: this.handleClose,
          participantLeft: this.handleParticipantLeft,
          participantJoined: this.handleParticipantJoined,
          videoConferenceJoined: this.handleVideoConferenceJoined,
          videoConferenceLeft: this.handleVideoConferenceLeft,
        });

        if (this.dialog_data.is_expired) {
          const isConfirmed = confirm("Can't join this meeting since meeting token is expired.");
          if (isConfirmed) {
            this.dialog.close();
          }
        }
      }
    });
  }

  handleClose = () => {
    this.api.dispose();
    this.dialog.close();
  }

  handleParticipantLeft = async (participant: any) => {
    console.log("handleParticipantLeft", participant);
    const data = await this.getParticipants();
    console.log("left participants", data);
  }

  handleParticipantJoined = async () => {
    const data = await this.getParticipants();
    console.log("joined participants", data);
  }

  handleVideoConferenceJoined = async (participant: any) => {
    console.log("handleVideoConferenceJoined", participant);
    const data = await this.getParticipants();
    console.log("conference joined participants", data);
  }

  handleVideoConferenceLeft() {
    console.log("handleVideoConferenceLeft");
  }

  getParticipants() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.api.getParticipantsInfo());
      }, 500);
    });
  }
}
