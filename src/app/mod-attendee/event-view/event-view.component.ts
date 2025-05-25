import { Component, inject } from '@angular/core';
import { EventService } from '../../services/event.service';
import { SessionService } from '../../services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, concatMap, EMPTY, map, shareReplay, switchMap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { MeetingService } from '../../services/meeting.service';
import { MatDialog } from '@angular/material/dialog';
import { AttendeeMeetingDialogComponent } from '../../components/attendee-meeting-dialog/attendee-meeting-dialog.component';
import { Location } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrl: './event-view.component.scss'
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private sessionService = inject(SessionService);
  private aroute = inject(ActivatedRoute);
  private route = inject(Router);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private meetingService = inject(MeetingService);
  private refresh$ = new BehaviorSubject(null);
  private dialog = inject(MatDialog);
  location = inject(Location);

  private is_expired = false;

  event$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventService.getOneById(params.id)),
    map((res) => res.data),
    catchError(() => {
      this.route.navigateByUrl("attendee/dashboard/not-found");
      return EMPTY;
    }),
    shareReplay(1)
  );

  sessions$ = this.aroute.params.pipe(
    switchMap((params: any) => this.sessionService.getAll(params.id)),
    map((res) => res.data),
    shareReplay(1)
  );

  has_registered$ = this.refresh$.pipe(
    switchMap(() => this.event$.pipe(
      concatMap((event) => this.eventRegisterService.hasRegistered(event._id).pipe(
        map((res) => res.has_registered)
      )),
      shareReplay(1)
    ))
  );

  is_register_approved$ = this.refresh$.pipe(
    switchMap(() => this.event$.pipe(
      concatMap((event) => this.eventRegisterService.isRegisterApproved(event._id).pipe(
        map((res) => res.is_register_approved)
      )),
      shareReplay(1)
    ))
  );

  is_invited$ = this.eventInviteService.getAllByUserId().pipe(
    map((res) => res.data),
    concatMap((invites) => this.event$.pipe(
      map((event) => !!invites.find((item) => item.event._id === event._id))
    )),
    shareReplay(1)
  );

  is_invite_accepted$ = this.eventInviteService.getAllAcceptedByUserId().pipe(
    map((res) => res.data),
    concatMap((accepts) => this.event$.pipe(
      map((event) => !!accepts.find((item) => item.event._id === event._id))
    )),
    shareReplay(1)
  );

  has_meeting_started$ = this.aroute.params.pipe(
    switchMap((params: any) => this.meetingService.isStarted(params.id)),
    map((res) => res.is_started),
    shareReplay(1)
  );

  constructor() {}

  ngOnInit() {
    this.aroute.params.pipe(
      switchMap((params: any) => this.meetingService.isExpired(params.id))
    ).subscribe({
      next: (res) => {
        this.is_expired = res.is_expired;
      }
    })
  }

  register(event_id: string) {
    this.eventRegisterService.register(event_id).subscribe({
      next: (res) => {
        this.refresh$.next(null);
        this.commonService.openSnackBar(res.message);
      }
    });
  }

  unregister(event_id: string) {
    const isConfirmed = confirm("Are you sure to unregister this event?");

    if (isConfirmed) {
      this.eventRegisterService.unregister(event_id).subscribe({
        next: (res) => {
          this.refresh$.next(null);
          this.commonService.openSnackBar(res.message);
        }
      });
    }
  }

  joinMeeting(event_id: string) {
    this.dialog.open(AttendeeMeetingDialogComponent, {
      width: "calc(100% - 10px)",
      maxWidth: "100%",
      height: "calc(100% - 10px)",
      maxHeight: "100%",
      disableClose: true,
      data: {
        event_id,
        is_expired: this.is_expired
      }
    });
  }
}
