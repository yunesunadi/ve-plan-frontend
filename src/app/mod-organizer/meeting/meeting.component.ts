import { Component, ElementRef, inject, input, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, concatMap, filter, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { ApiError } from '../../models/ApiError';
import { OrganizerMeetingDialogComponent } from '../../components/organizer-meeting-dialog/organizer-meeting-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { ParticipantService } from '../../services/participant.service';
import { MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell } from '@angular/material/table';
import { Participant } from '../../models/Participant';
import { AsyncPipe, DatePipe } from '@angular/common';
import Chart from "chart.js/auto";
import { UtilService } from '../../services/util.service';
import { PageQuery } from '../../models/Utils';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { PageEvent } from '@angular/material/paginator';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { Event } from '../../models/Event';

interface JoinedParticipantRow extends Participant {
  id: number;
}

@Component({
    selector: 'app-meeting',
    templateUrl: './meeting.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './meeting.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, DataTableComponent, ErrorStateComponent, MatButton, MatIcon, RouterLink, MatCard, MatCardTitle, MatCardSubtitle, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, AsyncPipe, DatePipe]
})
export class MeetingComponent {
  @ViewChild("doughnut_canvas") doughnut_canvas!: ElementRef;
  @ViewChild("line_canvas") line_canvas!: ElementRef;

  private meetingService = inject(MeetingService);
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private participantService = inject(ParticipantService);
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  private aroute = inject(ActivatedRoute);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);
  private refresh$ = new BehaviorSubject<boolean>(false);
  private dialog = inject(MatDialog);
  util = inject(UtilService);

  event = input.required<Event>();

  readonly PAGE_LIMIT = 10;
  role = signal("");
  participantSearch = signal("");
  joined_participants_total = signal(0);
  tableLoading = signal(true);
  tableError = signal<ApiError | null>(null);
  summaryError = signal<ApiError | null>(null);
  stay_times_available = signal(false);
  stay_times_reason = signal("");

  doughnut_chart!: Chart;
  line_chart!: Chart;

  query$ =  this.aroute.queryParams.pipe(
    switchMap((query) => {
      let qry: Partial<PageQuery>;

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

  meeting$ = this.refresh$.pipe(
    tap(() => this.summaryError.set(null)),
    concatMap(() => this.meetingService.getOneById(this.event()._id).pipe(
      map((res) => res.data),
      catchError((err: ApiError) => {
        if (err.status === 404) return of(null);
        this.summaryError.set(err);
        return of(null);
      })
    )),
    shareReplay(1)
  );

  registered_users$ = this.refresh$.pipe(
    switchMap(() => this.aroute.params.pipe(
      switchMap((params: any) => this.eventRegisterService.getAllApprovedByEventId(params.id)),
      map((res) => res.data),
      catchError((err: ApiError) => {
        this.summaryError.set(err);
        return of([]);
      }),
    )),
    shareReplay(1)
  );

  invitation_accepted_users$ = this.refresh$.pipe(
    switchMap(() => this.aroute.params.pipe(
      switchMap((params: any) => this.eventInviteService.getAllAcceptedByEventId(params.id)),
      map((res) => res.data),
      catchError((err: ApiError) => {
        this.summaryError.set(err);
        return of([]);
      }),
    )),
    shareReplay(1)
  );

  joined_participants_page$ = this.query$.pipe(
    tap(() => {
      this.tableLoading.set(true);
      this.tableError.set(null);
    }),
    switchMap((query) => this.aroute.params.pipe(
      switchMap((params: any) => this.participantService.getAllByEventId(params.id, query)),
      tap((res) => this.joined_participants_total.set(res.meta?.total ?? 0)),
      map((res): JoinedParticipantRow[] => res.data.map((data, index) => ({
        id: (query.offset ?? 0) + index + 1,
        ...data,
      }))),
    )),
    tap(() => this.tableLoading.set(false)),
    catchError((err: ApiError) => {
      this.tableLoading.set(false);
      this.tableError.set(err);
      return of([] as JoinedParticipantRow[]);
    }),
    shareReplay(1)
  );

  line_chart_data$ = this.refresh$.pipe(
    switchMap(() => this.aroute.params.pipe(
      switchMap((params: any) => this.participantService.getStayTimes(params.id))
    )),
    tap((res) => {
      const available = res.meta ? res.meta.available : res.data.length > 0;
      this.stay_times_available.set(available);
      this.stay_times_reason.set(res.meta?.reason || "");
    }),
    map((res) => res.data),
    catchError((err: ApiError) => {
      this.summaryError.set(err);
      return of([]);
    }),
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
    concatMap(() => this.meetingService.isCreated(this.event()._id).pipe(
      map((res) => res.is_created),
      catchError((err: ApiError) => {
        this.summaryError.set(err);
        return of(false);
      }),
    )),
    shareReplay(1)
  );

  ngOnInit() {
    this.joined_participants_page$.subscribe();

    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role.set(res.role);
      }
    });

    combineLatest([
      this.event_attendees$,
      this.joined_participants_page$
    ]).subscribe({
      next: ([event_attendees]) => {
        if (!this.doughnut_chart && this.doughnut_canvas?.nativeElement) {
          this.doughnut_chart = new Chart(this.doughnut_canvas.nativeElement, {
            type: "doughnut",
            data: {
              labels: [
                "Event Attendees",
                "Joined Participants",
              ],
              datasets: [{
                label: "No. of person",
                data: [event_attendees.length, this.joined_participants_total()],
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
        if (!this.stay_times_available() || !this.line_canvas?.nativeElement) {
          this.line_chart?.destroy();
          this.line_chart = undefined as any;
          return;
        }

        const labels = line_chart_data.map(item => item.label);
        const values = line_chart_data.map(item => item.value);

        if (this.line_chart) {
          this.line_chart.data.labels = labels;
          this.line_chart.data.datasets[0].data = values;
          this.line_chart.update();
          return;
        }

        this.line_chart = new Chart(this.line_canvas.nativeElement, {
          type: "line",
          data: {
            labels,
            datasets: [{
              label: "No. of participants",
              data: values,
              fill: true,
              borderColor: "#432E54",
              tension: 0.1
            }]
          },
        });
      }
    });
  }

  create() {
    this.meetingService.start(this.event()._id).subscribe({
      next: (res) => {
        this.refresh$.next(true);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
      }
    });
  }

  endMeeting(event_id: string) {
    this.confirmService.confirm({
      title: "End this meeting?",
      body: "Attendees will no longer be able to join.",
      confirmLabel: "End meeting",
      destructive: true,
    }).pipe(
      filter(Boolean),
      switchMap(() => this.meetingService.end(event_id))
    ).subscribe({
      next: (res) => {
        this.refresh$.next(true);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
      }
    });
  }

  reopenMeeting(event_id: string) {
    this.confirmService.confirm({
      title: "Re-open this meeting?",
      body: "Attendees will be able to join again.",
      confirmLabel: "Re-open",
    }).pipe(
      filter(Boolean),
      switchMap(() => this.meetingService.reopen(event_id))
    ).subscribe({
      next: (res) => {
        this.refresh$.next(true);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
      }
    });
  }

  join(event_id: string) {
    this.dialog.open(OrganizerMeetingDialogComponent, {
      width: "calc(100% - 10px)",
      maxWidth: "100%",
      height: "calc(100% - 10px)",
      maxHeight: "100%",
      disableClose: true,
      data: {
        event_id: event_id
      }
    }).afterClosed().subscribe(() => {
      this.refresh$.next(true);
    });
  }

  retry() {
    this.refresh$.next(true);
  }

  handlePageChange(event: PageEvent, query: Partial<PageQuery>, event_id: string) {
    const offset = event.pageIndex ? (event.pageIndex * this.PAGE_LIMIT) : undefined;
    this.router.navigate([`/${this.role()}/dashboard/events/${event_id}/meeting`], {
      queryParams:{ ...query, offset, limit: this.PAGE_LIMIT },
      replaceUrl: true
    });
  }

}
