import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { EventRegisterService } from '../../../services/event-register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, concatMap, map, of, switchMap } from 'rxjs';
import { EventInviteService } from '../../../services/event-invite.service';
import { MeetingService } from '../../../services/meeting.service';
import { CommonService } from '../../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
declare var JitsiMeetExternalAPI: any;

@Component({
  standalone: false,
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.scss'
})
export class MeetingComponent {
  @ViewChild("jitsi_iframe") jitsi_iframe: any;

  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private meetingService = inject(MeetingService);
  private aroute = inject(ActivatedRoute);
  private commonService = inject(CommonService);
  private router = inject(Router);

  domain: string = "8x8.vc";
  room: any;
  options: any;
  api: any;
  user: any;

  // For Custom Controls
  isAudioMuted = false;
  isVideoMuted = false;

  ngOnInit() {
    this.attendees$.subscribe(
      (res) => {
        console.log(res);
        
      }
    )

    this.room = '<AppID>/exampleroom'; // set your room name
    this.user = {
        name: 'yune' // set your username
    }

  }



  ngAfterViewInit(): void {
    this.options = {
      roomName: this.room,
      width: 700,
      height: 500,
      configOverwrite: {
        prejoinPageEnabled: false
      },
      interfaceConfigOverwrite: {
        startAudioMuted: true,
        startVideoMuted: true,
      },
      parentNode: this.jitsi_iframe.nativeElement,
      // userInfo: {
      //   displayName: this.user.name,
      //   email: 'john.doe@company.com',
      // },
      jwt: ""
    }
  }

  registered_users$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventRegisterService.getAllByEventId(params.id)),
    map((res) => res.data)
  );

  invite_accepted_users$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventInviteService.getAllAcceptedByEventId(params.id)),
    map((res) => res.data)
  );

  attendees$ = combineLatest([
    this.registered_users$,
    this.invite_accepted_users$
  ]).pipe(
    map((res) => {
      const users = [...res[0], ...res[1]];
      const unique_users = [...new Map(users.map(item => [item.user._id, item])).values()];
      
      return unique_users.map((item, index) => ({
        id: index + 1,
        name: item.user.name
      }));
    })
  );

  is_created$ =  this.aroute.params.pipe(
    concatMap((params: any) => this.meetingService.isCreated(params.id).pipe(
      map((res) => res.is_created),
    ))
  );

  create() {
    this.aroute.params.pipe(
      concatMap((params: any) => this.meetingService.createToken().pipe(
        map((res) => res.token),
        concatMap((token) => this.meetingService.start(params.id, "some string", token))
      ))
    )
    .subscribe({
      next: (res) => {
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
    this.api = new JitsiMeetExternalAPI(this.domain, this.options);

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
