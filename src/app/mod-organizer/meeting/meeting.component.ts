import { Component, ElementRef, computed, effect, inject, input, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
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
import { MatTooltip } from '@angular/material/tooltip';
import { Participant } from '../../models/Participant';
import { Meeting } from '../../models/Meeting';
import { AsyncPipe, DatePipe } from '@angular/common';
import {
  Chart, DoughnutController, LineController, ArcElement, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend,
} from 'chart.js';
import { UtilService } from '../../services/util.service';
import { PageQuery } from '../../models/Utils';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { PageEvent } from '@angular/material/paginator';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { StatusChipComponent, StatusKind } from '../../shared/ui/status-chip/status-chip.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { Event } from '../../models/Event';

Chart.register(
  DoughnutController, LineController, ArcElement, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend,
);

interface JoinedParticipantRow extends Participant {
  id: number;
}

interface MeetingView {
  kind: StatusKind;
  explanation: string;
  canStart: boolean;
  canJoin: boolean;
  canEnd: boolean;
  canReopen: boolean;
  blockedReason: string;
}

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './meeting.component.scss',
  imports: [
    OutletInnerComponent, PageHeaderComponent, DataTableComponent, StatusChipComponent,
    ErrorStateComponent, EmptyStateComponent, SkeletonComponent,
    MatButton, MatIcon, MatTooltip, RouterLink,
    MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, AsyncPipe, DatePipe,
  ],
})
export class MeetingComponent {
  private doughnutCanvas = viewChild<ElementRef<HTMLCanvasElement>>('doughnut_canvas');
  private lineCanvas = viewChild<ElementRef<HTMLCanvasElement>>('line_canvas');

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
  role = signal('');
  participantSearch = signal('');
  joined_participants_total = signal(0);
  tableLoading = signal(true);
  tableError = signal<ApiError | null>(null);
  summaryError = signal<ApiError | null>(null);
  chartsLoading = signal(true);
  stay_times_available = signal(false);
  stay_times_reason = signal('');
  stay_times_data = signal<Array<{ label: string; value: number }>>([]);
  event_attendees_count = signal(0);

  private doughnut_chart?: Chart;
  private line_chart?: Chart;

  constructor() {
    effect(() => {
      const canvas = this.doughnutCanvas()?.nativeElement;
      const data = [this.event_attendees_count(), this.joined_participants_total()];
      if (!canvas) return;

      if (this.doughnut_chart) {
        this.doughnut_chart.data.datasets[0].data = data;
        this.doughnut_chart.update();
        return;
      }

      this.doughnut_chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Event attendees', 'Joined participants'],
          datasets: [{ label: 'No. of people', data, backgroundColor: ['#E8BCB9', '#432E54'] }],
        },
      });
    });

    effect(() => {
      const canvas = this.lineCanvas()?.nativeElement;
      const available = this.stay_times_available();
      const rows = this.stay_times_data();

      if (!available || !canvas) {
        this.line_chart?.destroy();
        this.line_chart = undefined;
        return;
      }

      const labels = rows.map((r) => r.label);
      const values = rows.map((r) => r.value);

      if (this.line_chart) {
        this.line_chart.data.labels = labels;
        this.line_chart.data.datasets[0].data = values;
        this.line_chart.update();
        return;
      }

      this.line_chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'No. of participants', data: values,
            fill: true, borderColor: '#432E54', tension: 0.1,
          }],
        },
      });
    });
  }

  query$ = this.aroute.queryParams.pipe(
    switchMap((query) => {
      let qry: Partial<PageQuery>;

      if (Object.keys(query).length > 0) {
        qry = Object.fromEntries(new URLSearchParams(query));
      } else {
        qry = { limit: this.PAGE_LIMIT };
      }

      return of(qry);
    }),
    shareReplay(1),
  );

  meeting$ = this.refresh$.pipe(
    tap(() => this.summaryError.set(null)),
    concatMap(() => this.meetingService.getOneById(this.event()._id).pipe(
      map((res) => res.data as Meeting),
      catchError((err: ApiError) => {
        if (err.status === 404) return of(null);
        this.summaryError.set(err);
        return of(null);
      }),
    )),
    shareReplay(1),
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
    shareReplay(1),
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
    shareReplay(1),
  );

  joined_participants_page$ = combineLatest([this.refresh$, this.query$]).pipe(
    tap(() => {
      this.tableLoading.set(true);
      this.tableError.set(null);
    }),
    switchMap(([, query]) => this.aroute.params.pipe(
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
    shareReplay(1),
  );

  line_chart_data$ = this.refresh$.pipe(
    switchMap(() => this.aroute.params.pipe(
      switchMap((params: any) => this.participantService.getStayTimes(params.id)),
    )),
    tap((res) => {
      const available = res.meta ? res.meta.available : res.data.length > 0;
      this.stay_times_available.set(available);
      this.stay_times_reason.set(res.meta?.reason || '');
      this.stay_times_data.set(res.data);
    }),
    map((res) => res.data),
    catchError((err: ApiError) => {
      this.summaryError.set(err);
      return of([]);
    }),
    shareReplay(1),
  );

  event_attendees$ = combineLatest([
    this.registered_users$,
    this.invitation_accepted_users$,
  ]).pipe(
    map(([registered_users, invitation_accepted_users]) => (
      [...new Map([...registered_users, ...invitation_accepted_users]
        .map((item) => [item.user._id, item])).values()]
    )),
  );

  is_created$ = this.refresh$.pipe(
    concatMap(() => this.meetingService.isCreated(this.event()._id).pipe(
      map((res) => res.is_created),
      catchError((err: ApiError) => {
        this.summaryError.set(err);
        return of(false);
      }),
    )),
    shareReplay(1),
  );

  readonly doughnutTable = computed(() => [
    { label: 'Event attendees', value: this.event_attendees_count() },
    { label: 'Joined participants', value: this.joined_participants_total() },
  ]);

  ngOnInit() {
    this.joined_participants_page$.subscribe();

    this.dashboardCache.has_role.subscribe({
      next: (res) => this.role.set(res.role),
    });

    combineLatest([this.event_attendees$, this.joined_participants_page$]).subscribe({
      next: ([event_attendees]) => {
        this.event_attendees_count.set(event_attendees.length);
        this.chartsLoading.set(false);
      },
    });

    this.line_chart_data$.subscribe({
      next: () => this.chartsLoading.set(false),
    });
  }

  ngOnDestroy() {
    this.doughnut_chart?.destroy();
    this.line_chart?.destroy();
  }

  meetingView(isCreated: boolean | null, meeting: Meeting | null): MeetingView {
    const event = this.event();
    const expired = this.util.is_event_expired(event);
    const window = this.util.joinWindowState(event);
    const opensAt = this.formatClock(window.opensAt);

    if (!isCreated) {
      return {
        kind: 'meeting_not_started',
        explanation: expired
          ? 'This event has ended, so a meeting can no longer be started.'
          : window.state === 'early'
            ? `Start the meeting any time — attendees can join from ${opensAt}.`
            : 'No meeting room yet. Start the meeting so attendees can join.',
        canStart: !expired && window.state !== 'closed',
        canJoin: false, canEnd: false, canReopen: false,
        blockedReason: expired
          ? 'This event has already ended.'
          : window.state === 'closed'
            ? 'The join window for this event has closed.'
            : '',
      };
    }

    if (meeting?.ended) {
      return {
        kind: 'meeting_ended',
        explanation: 'This meeting has ended. Attendees can’t join until you re-open it.',
        canStart: false, canJoin: false, canEnd: false,
        canReopen: !expired && window.state !== 'closed',
        blockedReason: expired
          ? 'This event has already ended.'
          : window.state === 'closed'
            ? 'The join window has closed; the meeting can no longer be re-opened.'
            : '',
      };
    }

    if (window.state === 'closed') {
      return {
        kind: 'meeting_ended',
        explanation: 'The join window for this event has closed. Attendees can no longer join.',
        canStart: false, canJoin: false, canReopen: false, canEnd: true,
        blockedReason: 'The join window has closed.',
      };
    }

    if (meeting?.host_present) {
      return {
        kind: 'meeting_live',
        explanation: 'The meeting is live. Attendees can join now.',
        canStart: false, canReopen: false,
        canJoin: !expired, canEnd: !expired,
        blockedReason: expired ? 'This event has already ended.' : '',
      };
    }

    if (window.state === 'early') {
      return {
        kind: 'meeting_scheduled',
        explanation: `The room is ready. Join opens for attendees at ${opensAt}.`,
        canStart: false, canReopen: false, canJoin: false, canEnd: true,
        blockedReason: `Join opens at ${opensAt}.`,
      };
    }

    return {
      kind: 'meeting_scheduled',
      explanation: 'The room is ready. Join to open the meeting for attendees.',
      canStart: false, canReopen: false,
      canJoin: !expired, canEnd: !expired,
      blockedReason: expired ? 'This event has already ended.' : '',
    };
  }

  private formatClock(ms: number): string {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(ms);
  }

  create() {
    this.meetingService.start(this.event()._id).subscribe({
      next: (res) => {
        this.refresh$.next(true);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }

  endMeeting(event_id: string) {
    this.confirmService.confirm({
      title: 'End this meeting?',
      body: 'Attendees will no longer be able to join.',
      confirmLabel: 'End meeting',
      destructive: true,
    }).pipe(
      filter(Boolean),
      switchMap(() => this.meetingService.end(event_id)),
    ).subscribe({
      next: (res) => {
        this.refresh$.next(true);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }

  reopenMeeting(event_id: string) {
    this.confirmService.confirm({
      title: 'Re-open this meeting?',
      body: 'Attendees will be able to join again.',
      confirmLabel: 'Re-open',
    }).pipe(
      filter(Boolean),
      switchMap(() => this.meetingService.reopen(event_id)),
    ).subscribe({
      next: (res) => {
        this.refresh$.next(true);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }

  join(event_id: string) {
    this.dialog.open(OrganizerMeetingDialogComponent, {
      width: 'calc(100% - 10px)',
      maxWidth: '100%',
      height: 'calc(100% - 10px)',
      maxHeight: '100%',
      panelClass: 'meeting-dialog',
      disableClose: true,
      data: { event_id, event_title: this.event().title },
    }).afterClosed().subscribe(() => this.refresh$.next(true));
  }

  retry() {
    this.refresh$.next(true);
  }

  handlePageChange(event: PageEvent, query: Partial<PageQuery>, event_id: string) {
    const offset = event.pageIndex ? (event.pageIndex * this.PAGE_LIMIT) : undefined;
    this.router.navigate([`/${this.role()}/dashboard/events/${event_id}/meeting`], {
      queryParams: { ...query, offset, limit: this.PAGE_LIMIT },
      replaceUrl: true,
    });
  }
}
