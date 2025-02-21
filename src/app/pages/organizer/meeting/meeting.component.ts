import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, concatMap, map, switchMap } from 'rxjs';
import { MeetingService } from '../../../services/meeting.service';
import { CommonService } from '../../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { nanoid } from "nanoid";

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

  // For Custom Controls
  isAudioMuted = false;
  isVideoMuted = false;

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.refresh$.pipe(
      switchMap(() => this.aroute.params.pipe(
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
    ))
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
      videoConferenceLeft: this.handleVideoConferenceLeft,
      audioMuteStatusChanged: this.handleMuteStatus,
      videoMuteStatusChanged: this.handleVideoStatus,
      passwordRequired: this.passwordRequired,
    });
  }

  passwordRequired = async () => {
    console.log('passwordRequired'); // { id: "2baa184e" }
    this.api.executeCommand('password', 'The Password');
  };

  handleClose = () => {
    console.log("handleClose");
  }

  handleParticipantLeft = async (participant: any) => {
    console.log("handleParticipantLeft", participant); // { id: "2baa184e" }
    const data = await this.getParticipants();
    console.log("left participants", data);
  }

  handleParticipantJoined = async (participant: any) => {
    console.log("handleParticipantJoined", participant); // { id: "2baa184e", displayName: "Shanu Verma", formattedDisplayName: "Shanu Verma" }
    const data = await this.getParticipants();
    console.log("joined participants", data);
  }

  handleVideoConferenceJoined = async (participant: any) => {
    console.log("handleVideoConferenceJoined", participant); // { roomName: "bwb-bfqi-vmh", id: "8c35a951", displayName: "Akash Verma", formattedDisplayName: "Akash Verma (me)"}
    const data = await this.getParticipants();
    console.log("conference joined participants", data);
  }

  handleVideoConferenceLeft = () => {
    console.log("handleVideoConferenceLeft");
    this.router.navigateByUrl("/home");
  }

  handleMuteStatus = (audio: any) => {
    console.log("handleMuteStatus", audio); // { muted: true }
  }

  handleVideoStatus = (video: any) => {
    console.log("handleVideoStatus", video); // { muted: true }
  }

  getParticipants() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.api.getParticipantsInfo()); // get all participants
      }, 500)
    });
  }

  // custom events
  executeCommand(command: string) {
    this.api.executeCommand(command);;
    if(command == 'hangup') {
      this.router.navigateByUrl("organizer/dashboard/home");
      return;
    }

    if(command == 'toggleAudio') {
      this.isAudioMuted = !this.isAudioMuted;
    }

    if(command == 'toggleVideo') {
      this.isVideoMuted = !this.isVideoMuted;
    }
  }



}
