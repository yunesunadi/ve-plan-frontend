import { Component, inject, input, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { UserService } from '../../services/user.service';
import { InvitationSentDialogComponent } from '../../components/invitation-sent-dialog/invitation-sent-dialog.component';
import { InvitedUsersDialogComponent } from '../../components/invited-users-dialog/invited-users-dialog.component';
import { AcceptedUsersDialogComponent } from '../../components/accepted-users-dialog/accepted-users-dialog.component';
import { AsyncPipe } from '@angular/common';
import { UtilService } from '../../services/util.service';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { EmailDeliveryStatusComponent } from '../../components/email-delivery-status/email-delivery-status.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { PageEvent } from '@angular/material/paginator';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { ApiError } from '../../models/ApiError';
import { Event } from '../../models/Event';

interface InviteCandidateRow {
  id: number;
  name: string;
  email: string;
  event_title: string;
  user_id: string;
  event_id: string;
}

const PAGE_SIZE = 50;
const MIN_SEARCH_LENGTH = 2;

@Component({
    selector: 'app-invite',
    templateUrl: './invite.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './invite.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, DataTableComponent, MatButton, MatIcon, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, AsyncPipe, EmailDeliveryStatusComponent]
})
export class InviteComponent {
  @ViewChild(EmailDeliveryStatusComponent) emailStatus?: EmailDeliveryStatusComponent;

  readonly PAGE_SIZE = PAGE_SIZE;

  event = input.required<Event>();
  private event$ = toObservable(this.event);

  role = signal("");
  tableLoading = signal(false);
  tableError = signal<ApiError | null>(null);
  total = signal(0);
  selection: InviteCandidateRow[] = [];

  private userService = inject(UserService);
  private aroute = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private dashboardCache = inject(DashboardCacheService);
  util = inject(UtilService);

  query$ = this.aroute.queryParams.pipe(
    map((query) => ({
      search: typeof query['search'] === 'string' ? query['search'] : '',
      offset: Math.max(0, Number(query['offset']) || 0),
    })),
    shareReplay(1)
  );

  private refresh$ = new BehaviorSubject(null);

  dataSource$ = this.refresh$.pipe(
    switchMap(() => this.query$.pipe(
      tap(() => {
        this.tableLoading.set(true);
        this.tableError.set(null);
      }),
      switchMap((query) => this.event$.pipe(
        switchMap((event) => {
          if (query.search.trim().length < MIN_SEARCH_LENGTH) {
            this.total.set(query.offset);
            return of({ event, data: [] as InviteCandidateRow[] });
          }

          const page = Math.floor(query.offset / PAGE_SIZE) + 1;

          return this.userService.getAttendees(query.search, page).pipe(
            tap((res) => {
              const full = res.data.length === PAGE_SIZE;
              this.total.set(query.offset + res.data.length + (full ? PAGE_SIZE : 0));
            }),
            map((res): { event: typeof event; data: InviteCandidateRow[] } => ({
              event,
              data: res.data.map((item, index) => ({
                id: query.offset + index + 1,
                name: item.name,
                email: item.email,
                event_id: event._id,
                event_title: event.title,
                user_id: item._id,
              })),
            })),
          );
        }),
      )),
      map(({ data }) => data),
      tap(() => this.tableLoading.set(false)),
      catchError((err: ApiError) => {
        this.tableLoading.set(false);
        this.tableError.set(err);
        return of([] as InviteCandidateRow[]);
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

  sendInvitation(rows: InviteCandidateRow[], event_id: string) {
    const dialogRef = this.dialog.open(InvitationSentDialogComponent, {
      data: rows,
      disableClose: true,
      width: "500px"
    });

    dialogRef.afterClosed().subscribe({
      next: (sent) => {
        this.selection = [];
        if (sent) {
          this.handleSearchChange('', { search: '', offset: 0 }, event_id);
          this.refresh$.next(null);
          this.emailStatus?.refresh();
          setTimeout(() => this.emailStatus?.refresh(), 6000);
        }
      }
    });
  }

  openInvitedUsersDialog(event_id: string) {
    this.dialog.open(InvitedUsersDialogComponent, {
      data: {
        id: event_id
      },
      width: "500px"
    });
  }

  openAcceptedUsersDialog(event_id: string) {
    this.dialog.open(AcceptedUsersDialogComponent, {
      data: {
        id: event_id
      },
      width: "500px"
    });
  }

  retry() {
    this.refresh$.next(null);
  }

  handleSearchChange(search: string, query: { search: string; offset: number }, event_id: string) {
    this.router.navigate([`/organizer/dashboard/events/${event_id}/invite`], {
      queryParams: { ...query, search: search || undefined, offset: undefined },
      replaceUrl: true
    });
  }

  handlePageChange(event: PageEvent, query: { search: string; offset: number }, event_id: string) {
    const offset = event.pageIndex ? event.pageIndex * PAGE_SIZE : undefined;
    this.router.navigate([`/organizer/dashboard/events/${event_id}/invite`], {
      queryParams: { ...query, offset },
      replaceUrl: true
    });
  }
}
