import { Component, inject, ViewChild } from '@angular/core';
import { map } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { environment } from '../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MeetingParticipant } from '../../models/Participant';
import { CommonService } from '../../services/common.service';

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
  private commonService = inject(CommonService);

  options: any;
  api: any;
  room_name = "";

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
        this.room_name = data.room_name;

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

  handleVideoConferenceLeft = async (participant: any) => {
    this.meetingService.updateEndTime(this.dialog_data.event_id, { end_time: new Date().toISOString() })
      .subscribe({
        next: () => {
          this.commonService.openSnackBar("End meeting successfully.");
        }
      });
  }
}
