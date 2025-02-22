import { Component, inject, ViewChild } from '@angular/core';
import { MeetingService } from '../../../services/meeting.service';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserPayload } from '../../../models/User';
import { jwtDecode } from 'jwt-decode';

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
  private router = inject(Router);

  options: any;
  api: any;
  event_id = "";

  ngOnDestroy() {
    if (this.api) {
      this.api.dispose();
    }
  }

  ngAfterViewInit(): void {
    this.aroute.params.pipe(
      tap((params: any) => {
        this.event_id = params.id;
      }),
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

    this.api.addEventListeners({
      readyToClose: this.handleClose,
    });
  }

  handleClose = () => {
    const token = localStorage.getItem("token") || "";
    const decoded: UserPayload = jwtDecode(token);
    // const isConfirmed = confirm("Are you sure to leave this event meeting?");

    // if (isConfirmed) {
      this.api.dispose();
      this.router.navigateByUrl(`/${decoded.role}/dashboard/events/${this.event_id}/view`);
    // }
  }
}
