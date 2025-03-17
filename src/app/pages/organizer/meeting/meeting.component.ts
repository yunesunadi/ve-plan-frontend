import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, concatMap, map, shareReplay } from 'rxjs';
import { MeetingService } from '../../../services/meeting.service';
import { CommonService } from '../../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { nanoid } from "nanoid";
import { OrganizerMeetingDialogComponent } from '../../../components/organizer-meeting-dialog/organizer-meeting-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.scss'
})
export class MeetingComponent {
  private meetingService = inject(MeetingService);
  private aroute = inject(ActivatedRoute);
  private commonService = inject(CommonService);
  private refresh$ = new BehaviorSubject<boolean>(false);
  private dialog = inject(MatDialog);

  event_id = "";

  ngOnInit() {
    this.aroute.params.subscribe({
      next: (params: any) => {
        this.event_id = params.id;
      }
    });
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
    this.dialog.open(OrganizerMeetingDialogComponent, {
      width: "calc(100% - 10px)",
      maxWidth: "100%",
      height: "calc(100% - 10px)",
      maxHeight: "100%",
      disableClose: true,
      data: {
        event_id: this.event_id
      }
    });
  }

}
