import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, concatMap, map, shareReplay, switchMap, tap } from 'rxjs';
import { MeetingService } from '../../../services/meeting.service';
import { CommonService } from '../../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { nanoid } from "nanoid";
import { jwtDecode } from 'jwt-decode';
import { UserPayload } from '../../../models/User';

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
  private commonService = inject(CommonService);
  private router = inject(Router);
  private refresh$ = new BehaviorSubject<boolean>(false);

  options: any;
  api: any;
  event_id = "";

  ngOnInit() {}

  ngOnDestroy() {
    if (this.api) {
      this.api.dispose();
    }
  }

  ngAfterViewInit(): void {
    this.refresh$.pipe(
      switchMap(() => this.aroute.params.pipe(
        tap((params: any) => {
          this.event_id = params.id;
        }),
        concatMap((params: any) => this.meetingService.getOneById(params.id)),
        map((res) => res.data)
      ))
    ).subscribe({
      next: (data) => {
        this.options = {
          roomName: `${environment.appId}/${data.room_name}`,
          width: 1000,
          height: 400,
          configOverwrite: {
            prejoinPageEnabled: false
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

  is_created$ = this.refresh$.pipe(
    switchMap(() => this.aroute.params.pipe(
      concatMap((params: any) => this.meetingService.isCreated(params.id).pipe(
        map((res) => res.is_created),
      ))
    )),
    shareReplay(1)
  );

  create() {
    this.aroute.params.pipe(
      concatMap((params: any) => this.meetingService.createToken(true).pipe(
        map((res) => res.token),
        concatMap((token) => this.meetingService.start(params.id, nanoid(), token))
      ))
    )
    .subscribe({
      next: (res) => {
        this.refresh$.next(true);
        this.commonService.openSnackBar(res.message);
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    });
  }

  join() {
    this.api = new JitsiMeetExternalAPI(environment.meeting_domain, this.options);

    this.api.addEventListeners({
      readyToClose: this.handleClose,
      participantLeft: this.handleParticipantLeft,
      participantJoined: this.handleParticipantJoined,
      videoConferenceJoined: this.handleVideoConferenceJoined,
      // videoConferenceLeft: this.handleVideoConferenceLeft,
      audioMuteStatusChanged: this.handleMuteStatus,
      videoMuteStatusChanged: this.handleVideoStatus,
      passwordRequired: this.passwordRequired,
    });
  }

  passwordRequired = async () => {
    console.log('passwordRequired');
    this.api.executeCommand('password', 'The Password');
  };

  handleClose = () => {
    const token = localStorage.getItem("token") || "";
    const decoded: UserPayload = jwtDecode(token);
    // const isConfirmed = confirm("Are you sure to leave this event meeting?");

    // if (isConfirmed) {
      this.api.dispose();
      this.router.navigateByUrl(`/${decoded.role}/dashboard/events/${this.event_id}/view`);
    // }
  }

  handleParticipantLeft = async (participant: any) => {
    console.log("handleParticipantLeft", participant);
    const data = await this.getParticipants();
    console.log("left participants", data);
  }

  handleParticipantJoined = async (participant: any) => {
    console.log("handleParticipantJoined", participant);
    const data = await this.getParticipants();
    console.log("joined participants", data);
  }

  handleVideoConferenceJoined = async (participant: any) => {
    console.log("handleVideoConferenceJoined", participant);
    const data = await this.getParticipants();
    console.log("conference joined participants", data);
  }

  // handleVideoConferenceLeft = () => {
  //   const token = localStorage.getItem("token") || "";
  //   const decoded: UserPayload = jwtDecode(token);
  //   this.router.navigateByUrl(`/${decoded.role}/dashboard/events/${this.event_id}/view`);
  // }

  handleMuteStatus = (audio: any) => {
    console.log("handleMuteStatus", audio);
  }

  handleVideoStatus = (video: any) => {
    console.log("handleVideoStatus", video);
  }

  getParticipants() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.api.getParticipantsInfo());
      }, 500);
    });
  }

}
