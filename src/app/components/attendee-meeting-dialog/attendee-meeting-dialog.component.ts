import { Component, inject, ViewChild } from '@angular/core';
import { MeetingService } from '../../services/meeting.service';
import { concatMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

declare var JitsiMeetExternalAPI: any;

@Component({
  standalone: false,
  selector: 'app-attendee-meeting-dialog',
  templateUrl: './attendee-meeting-dialog.component.html',
  styleUrl: './attendee-meeting-dialog.component.scss'
})
export class AttendeeMeetingDialogComponent {
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
    this.meetingService.getOneByEventId(this.dialog_data.event_id).pipe(
      map((res) => res.data.room_name),
      concatMap((room_name) => this.meetingService.createToken(false).pipe(
        map((data) => ({ room_name, token: data.token }))
      )),
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
}
