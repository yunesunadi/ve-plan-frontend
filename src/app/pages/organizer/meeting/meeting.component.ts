import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, concatMap, map, shareReplay } from 'rxjs';
import { MeetingService } from '../../../services/meeting.service';
import { CommonService } from '../../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { nanoid } from "nanoid";
import { OrganizerMeetingDialogComponent } from '../../../components/organizer-meeting-dialog/organizer-meeting-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ParticipantService } from '../../../services/participant.service';
import { Participant } from '../../../models/Participant';

@Component({
  standalone: false,
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.scss'
})
export class MeetingComponent {
  private meetingService = inject(MeetingService);
  private participantService = inject(ParticipantService);
  private aroute = inject(ActivatedRoute);
  private commonService = inject(CommonService);
  private refresh$ = new BehaviorSubject<boolean>(false);
  private dialog = inject(MatDialog);
  private closed$ = new BehaviorSubject(null);

  event_id = "";
  private is_expired = false;
  meeting = <Participant>{};

  ngOnInit() {
    this.aroute.params.subscribe({
      next: (params: any) => {
        this.event_id = params.id;
      }
    });

    this.meetingService.isExpired(this.event_id).subscribe({
      next: (res) => {
        this.is_expired = res.is_expired;
      }
    });

    this.closed$.pipe(
      concatMap(() => this.participantService.getOneById(this.event_id).pipe(
        map((res) => res.data)
      ))
    ).subscribe({
      next: (res) => {
        this.meeting = res;
      }
    })
  }

  is_created$ = this.refresh$.pipe(
    concatMap(() => this.meetingService.isCreated(this.event_id).pipe(
      map((res) => res.is_created),
    )),
    shareReplay(1)
  );

  create() {
    this.meetingService.createToken(true).pipe(
      map((res) => res.token),
      concatMap((token) => this.meetingService.start(this.event_id, nanoid(), token))
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
    const dialogRef = this.dialog.open(OrganizerMeetingDialogComponent, {
      width: "calc(100% - 10px)",
      maxWidth: "100%",
      height: "calc(100% - 10px)",
      maxHeight: "100%",
      disableClose: true,
      data: {
        event_id: this.event_id,
        is_expired: this.is_expired
      }
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
        this.closed$.next(null);
      }
    });
  }

}
