import { Component, inject, input, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { BehaviorSubject, catchError, combineLatest, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { MeetingStartedDialogComponent } from '../../components/meeting-started-dialog/meeting-started-dialog.component';
import { AsyncPipe } from '@angular/common';
import { PageQuery } from '../../models/Utils';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { UtilService } from '../../services/util.service';
import { PageEvent } from '@angular/material/paginator';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { EmailDeliveryStatusComponent } from '../../components/email-delivery-status/email-delivery-status.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { ApiError } from '../../models/ApiError';
import { Event } from '../../models/Event';

interface EventAttendeeRow {
  id: number;
  name: string;
  email: string;
  event_title: string;
  user_id: string;
  event_id: string;
  meeting_started: boolean;
  type: string;
}

@Component({
    selector: 'app-event-attendees',
    templateUrl: './event-attendees.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './event-attendees.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, DataTableComponent, MatButton, MatIcon, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, AsyncPipe, EmailDeliveryStatusComponent]
})
export class EventAttendeesComponent {
  @ViewChild(EmailDeliveryStatusComponent) emailStatus?: EmailDeliveryStatusComponent;

  event = input.required<Event>();

  role = signal("");
  data_length = signal(0);
  tableLoading = signal(true);
  tableError = signal<ApiError | null>(null);
  selection: EventAttendeeRow[] = [];

  readonly PAGE_LIMIT = 10;

  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private dashboardCache = inject(DashboardCacheService);
  private aroute = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  util = inject(UtilService);

  refresh$ = new BehaviorSubject(null);

  query$ =  this.aroute.queryParams.pipe(
    switchMap((query) => {
      let qry: Partial<PageQuery> & { search?: string };

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

  event_attendees$ = this.refresh$.pipe(
    tap(() => {
      this.tableLoading.set(true);
      this.tableError.set(null);
    }),
    switchMap(() => this.query$.pipe(
      switchMap((query) => combineLatest([
        this.aroute.params.pipe(
          switchMap((params: any) => this.eventRegisterService.getAllApprovedByEventId(params.id)),
          map((res) => res.data.map((item => ({ ...item, type: "register_approved" }))))
        ),
        this.aroute.params.pipe(
          switchMap((params: any) => this.eventInviteService.getAllAcceptedByEventId(params.id)),
          map((res) => res.data.map((item => ({ ...item, type: "invitation_approved" }))))
        )
      ]).pipe(
        map((res): EventAttendeeRow[] => {
          const users = [...res[0], ...res[1]];
          const unique_users = [...new Map(users.map(item => [item.user._id, item])).values()];
          const result = unique_users.map((item, index) => ({
            id: index + 1,
            name: item.user.name,
            email: item.user.email,
            event_title: item.event.title,
            user_id: item.user._id,
            event_id: item.event._id,
            meeting_started: item.meeting_started,
            type: item.type
          }));

          this.data_length.set(result.length);

          return result.slice(query.offset || 0, (query.offset || 0) + (query.limit || 0));
        }),
      )),
      tap(() => this.tableLoading.set(false)),
      catchError((err: ApiError) => {
        this.tableLoading.set(false);
        this.tableError.set(err);
        return of([] as EventAttendeeRow[]);
      }),
    )),
    shareReplay(1)
  );

  constructor() {}

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role.set(res.role);
      }
    });
  }

  send(rows: EventAttendeeRow[]) {
    const dialogRef = this.dialog.open(MeetingStartedDialogComponent, {
      data: rows.filter(item => !item.meeting_started),
      width: "500px",
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe({
      next: (fetched) => {
        if (fetched) {
          this.selection = [];
          this.refresh$.next(null);
          this.emailStatus?.refresh();
          setTimeout(() => this.emailStatus?.refresh(), 6000);
        }
      }
    });
  }

  retry() {
    this.refresh$.next(null);
  }

  handleSearchChange(search: string, query: Partial<PageQuery> & { search?: string }, event_id: string) {
    this.router.navigate([`/${this.role()}/dashboard/events/${event_id}/meeting/attendees`], {
      queryParams: { ...query, search: search || undefined, offset: undefined },
      replaceUrl: true
    });
  }

  handlePageChange(event: PageEvent, query: Partial<PageQuery>, event_id: string) {
    const offset = event.pageIndex ? (event.pageIndex * this.PAGE_LIMIT) : undefined;
    this.router.navigate([`/${this.role()}/dashboard/events/${event_id}/meeting/attendees`], {
      queryParams:{ ...query, offset, limit: this.PAGE_LIMIT },
      replaceUrl: true
    });
  }

  isRowSelectable = (row: EventAttendeeRow) => !row.meeting_started;

}
