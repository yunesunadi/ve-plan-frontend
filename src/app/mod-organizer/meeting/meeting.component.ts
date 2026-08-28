import { Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, concatMap, map, of, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { CommonService } from '../../services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { nanoid } from "nanoid";
import { OrganizerMeetingDialogComponent } from '../../components/organizer-meeting-dialog/organizer-meeting-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { ParticipantService } from '../../services/participant.service';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Participant } from '../../models/Participant';
import { Location, AsyncPipe, DatePipe } from '@angular/common';
import Chart from "chart.js/auto";
import { EventService } from '../../services/event.service';
import { UtilService } from '../../services/util.service';
import { PageQuery } from '../../models/Utils';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatFormField, MatPrefix, MatLabel, MatInput } from '@angular/material/input';

@Component({
    selector: 'app-meeting',
    templateUrl: './meeting.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './meeting.component.scss',
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatIcon, RouterLink, MatCard, MatCardTitle, MatCardSubtitle, MatFormField, MatPrefix, MatLabel, MatInput, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatPaginator, AsyncPipe, DatePipe]
})
export class MeetingComponent {
  @ViewChild("doughnut_canvas") doughnut_canvas!: ElementRef;
  @ViewChild("line_canvas") line_canvas!: ElementRef;

  private meetingService = inject(MeetingService);
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private eventService = inject(EventService);
  private participantService = inject(ParticipantService);
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  private aroute = inject(ActivatedRoute);
  private commonService = inject(CommonService);
  private refresh$ = new BehaviorSubject<boolean>(false);
  private dialog = inject(MatDialog);
  location = inject(Location);
  util = inject(UtilService);

  displayedColumns: string[] = ['id', 'name', 'start_time', 'end_time', 'duration'];
  selection = new SelectionModel<any>(true, []);

  readonly PAGE_LIMIT = 10;
  role = signal("");
  all_joined_participants = signal<Participant[]>([]);
  isLoading = signal(true);

  doughnut_chart!: Chart;
  line_chart!: Chart;

  query$ =  this.aroute.queryParams.pipe(
    switchMap((query) => {
      let qry = <Partial<PageQuery>>{};

      if (Object.keys(query).length > 0) {
        qry = Object.fromEntries(new URLSearchParams(query));
      } else {
        qry = {
          limit: this.PAGE_LIMIT 
        };
      }

      return of(qry);
    }),
    shareReplay(1)
  );

  event$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventService.getOneById(params.id).pipe(
      tap(() => this.isLoading.set(false)),
      map(res => res.data)
    )),
    shareReplay(1)
  );

  is_expired$ = this.event$.pipe(
    concatMap((event) => this.meetingService.isExpired(event._id).pipe(
      map(res => res.is_expired)
    )),
    shareReplay(1)
  );

  meeting$ = this.refresh$.pipe(
    switchMap(() => this.event$.pipe(
      concatMap((event) => this.meetingService.getOneById(event._id).pipe(
        map((res) => res.data)
      ))
    )),
    shareReplay(1)
  );

  registered_users$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventRegisterService.getAllApprovedByEventId(params.id)),
    map((res) => res.data),
    shareReplay(1)
  );

  invitation_accepted_users$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventInviteService.getAllAcceptedByEventId(params.id)),
    map((res) => res.data),
    shareReplay(1)
  );

  joined_participants_page$ = this.query$.pipe(
    switchMap((query) => this.aroute.params.pipe(
      switchMap((params: any) => this.participantService.getAllByEventId(params.id)),
      map(res => res.data),
      tap((result) => this.all_joined_participants.set(result)),
      map((result: Participant[]) => ({ result, query }))
    )),
    shareReplay(1)
  );

  joined_participants$ = this.joined_participants_page$.pipe(
    map(({ result }) => result)
  );

  dataSource$ = this.joined_participants_page$.pipe(
    map(({ result, query }) => {
      const participants = result.map((data: Participant, index: number) => ({ id: index + 1, ...data }));
      const paginated_result = participants.slice(query.offset || 0, (query.offset || 0) + (query.limit || 0));
      return new MatTableDataSource(paginated_result);
    }),
    startWith(new MatTableDataSource<any>([])),
    shareReplay(1)
  );

  line_chart_data$ = this.aroute.params.pipe(
    switchMap((params: any) => this.participantService.getStayTimes(params.id)),
    map((res) => res.data),
    shareReplay(1)
  );

  event_attendees$ = combineLatest([
    this.registered_users$,
    this.invitation_accepted_users$
  ]).pipe(
    map(([ registered_users, invitation_accepted_users]) => {
      return [...new Map([...registered_users, ...invitation_accepted_users]
        .map(item => [item.user._id, item])).values()];
    })
  );

  is_created$ = this.refresh$.pipe(
    switchMap(() => this.event$.pipe(
      concatMap((event) => this.meetingService.isCreated(event._id).pipe(
        map((res) => res.is_created),
      ))
    )),
    shareReplay(1)
  );

  ngOnInit() {
    this.joined_participants$.subscribe();

    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role.set(res.role);
      }
    });

    combineLatest([
      this.event_attendees$,
      this.joined_participants$
    ]).subscribe({
      next: ([event_attendees, joined_participants]) => {
        if (!this.doughnut_chart && !this.isLoading()) {
          this.doughnut_chart = new Chart(this.doughnut_canvas.nativeElement, {
            type: "doughnut",
            data: {
              labels: [
                "Event Attendees",
                "Joined Participants",
              ],
              datasets: [{
                label: "No. of person",
                data: [event_attendees.length, joined_participants.length],
                backgroundColor: [
                  "#E8BCB9",
                  "#432E54",
                ],
              }]
            },
          });
        }
      }
    });

    this.line_chart_data$.subscribe({
      next: (line_chart_data) => {
        if (!this.line_chart && !this.isLoading()) {
          this.line_chart = new Chart(this.line_canvas.nativeElement, {
            type: "line",
            data: {
              labels: line_chart_data.map(item => item.label),
              datasets: [{
                label: "No. of participants",
                data: line_chart_data.map(item => item.value),
                fill: true,
                borderColor: "#432E54",
                tension: 0.1
              }]
            },
          });
        }
      }
    });
  }

  create() {
    this.meetingService.createToken(true).pipe(
      map((res) => res.token),
      concatMap((token) => this.event$.pipe(
        concatMap((event) => this.meetingService.start(event._id, nanoid(), token))
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

  endMeeting(event_id: string) {
    const isConfirmed = confirm("End this meeting? Attendees will no longer be able to join.");

    if (!isConfirmed) return;

    this.meetingService.end(event_id).subscribe({
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

  reopenMeeting(event_id: string) {
    const isConfirmed = confirm("Re-open this meeting so attendees can join again?");

    if (!isConfirmed) return;

    this.meetingService.reopen(event_id).subscribe({
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

  join(event_id: string, is_expired: boolean) {
    this.dialog.open(OrganizerMeetingDialogComponent, {
      width: "calc(100% - 10px)",
      maxWidth: "100%",
      height: "calc(100% - 10px)",
      maxHeight: "100%",
      disableClose: true,
      data: {
        event_id: event_id,
        is_expired: is_expired
      }
    });
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  handlePageChange(event: PageEvent, query: Partial<PageQuery>, event_id: string) {
    const offset = event.pageIndex ? (event.pageIndex * this.PAGE_LIMIT) : undefined;
    this.router.navigate([`/${this.role()}/dashboard/events/${event_id}/meeting`], {
      queryParams:{ ...query, offset, limit: this.PAGE_LIMIT },
      replaceUrl: true
    });
  }

}
