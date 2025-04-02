import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, concatMap, map, shareReplay, switchMap } from 'rxjs';
import { MeetingService } from '../../../services/meeting.service';
import { CommonService } from '../../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { nanoid } from "nanoid";
import { OrganizerMeetingDialogComponent } from '../../../components/organizer-meeting-dialog/organizer-meeting-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Meeting } from '../../../models/Meeting';
import { EventRegisterService } from '../../../services/event-register.service';
import { EventInviteService } from '../../../services/event-invite.service';
import { ParticipantService } from '../../../services/participant.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { EventRegister } from '../../../models/EventRegister';
import { EventInvite } from '../../../models/EventInvite';
import { Participant } from '../../../models/Participant';
import { Location } from '@angular/common';
import Chart from "chart.js/auto";

@Component({
  standalone: false,
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.scss'
})
export class MeetingComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild("doughnut_canvas") doughnut_canvas: any;
  @ViewChild("line_canvas") line_canvas: any;

  private meetingService = inject(MeetingService);
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private participantService = inject(ParticipantService);
  private aroute = inject(ActivatedRoute);
  private commonService = inject(CommonService);
  private refresh$ = new BehaviorSubject<boolean>(false);
  private dialog = inject(MatDialog);
  private closed$ = new BehaviorSubject(null);
  location = inject(Location);

  event_id = "";
  private is_expired = false;
  meeting = <Meeting>{};
  registered_users: EventRegister[] = [];
  invitation_accepted_users: EventInvite[] = [];
  event_attendees: (EventRegister | EventInvite)[] = [];
  joined_participants: Participant[] = [];
  line_chart_data: {
    label: string;
    value: number;
  }[] = [];

  displayedColumns: string[] = ['id', 'name', 'start_time', 'end_time', 'duration'];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);

  doughnut_chart: any;
  line_chart: any;

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
      switchMap(() => this.meetingService.getOneById(this.event_id).pipe(
        map((res) => res.data)
      ))
    ).subscribe({
      next: (res) => {
        this.meeting = res;
      }
    });

    combineLatest([
      this.closed$.pipe(
        switchMap(() => this.aroute.params.pipe(
          switchMap((params: any) => this.eventRegisterService.getAllApprovedByEventId(params.id)),
          map((res) => res.data)
        ))
      ),
      this.closed$.pipe(
        switchMap(() => this.aroute.params.pipe(
          switchMap((params: any) => this.eventInviteService.getAllAcceptedByEventId(params.id)),
          map((res) => res.data)
        ))
      ),
      this.closed$.pipe(
        switchMap(() => this.aroute.params.pipe(
          switchMap((params: any) => this.participantService.getAllByEventId(params.id)),
          map(res => res.data)
        ))
      ),
      this.closed$.pipe(
        switchMap(() => this.aroute.params.pipe(
          switchMap((params: any) => this.participantService.getStayTimes(params.id)),
          map((res) => res.data)
        ))
      )
    ]).subscribe({
      next: (data) => {
        this.registered_users = data[0];
        this.invitation_accepted_users = data[1];
        this.joined_participants = data[2];
        this.line_chart_data = data[3];
        this.event_attendees = [...new Map([...this.registered_users, ...this.invitation_accepted_users]
          .map(item => [item.user._id, item])).values()];
        
        const participants = this.joined_participants
          .map((data: Participant, index: number) => ({ id: index + 1, ...data }));
        this.dataSource = new MatTableDataSource(participants);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.doughnut_chart = new Chart(this.doughnut_canvas.nativeElement, {
          type: "doughnut",
          data: {
            labels: [
              "Event Attendees",
              "Joined Participants",
            ],
            datasets: [{
              label: "No. of person",
              data: [this.event_attendees.length, this.joined_participants.length],
              backgroundColor: [
                "#E8BCB9",
                "#432E54",
              ],
            }]
          },
        });

        this.line_chart = new Chart(this.line_canvas.nativeElement, {
          type: "line",
          data: {
            labels: this.line_chart_data.map(item => item.label),
            datasets: [{
              label: "No. of participants",
              data: this.line_chart_data.map(item => item.value),
              fill: true,
              borderColor: "#432E54",
              tension: 0.1
            }]
          },
        });
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
