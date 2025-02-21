import { Component, inject, ViewChild } from '@angular/core';
import { MeetingService } from '../../../services/meeting.service';
import { ActivatedRoute } from '@angular/router';
import { concatMap, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

declare var JitsiMeetExternalAPI: any;

@Component({
  standalone: false,
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.scss'
})
export class MeetingComponent {
  @ViewChild("jitsi_iframe") jitsi_iframe: any;

  private meetingService = inject(MeetingService);
  private aroute = inject(ActivatedRoute);

  options: any;
  api: any;

  ngAfterViewInit(): void {
    this.aroute.params.pipe(
      concatMap((params: any) => this.meetingService.getOneByEventId(params.id).pipe(
        map((res) => res.data.room_name),
        concatMap((room_name) => this.meetingService.createToken(false).pipe(
          map((data) => ({ room_name, token: data.token }))
        )),
      )),
    ).subscribe({
      next: (data) => {
        this.options = {
          roomName: `${environment.appId}/${data.room_name}`,
          width: 1000,
          height: 400,
          configOverwrite: {
            prejoinPageEnabled: false,
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
      }
    });
  }

  join() {
    this.api = new JitsiMeetExternalAPI(environment.meeting_domain, this.options);
  }
}
