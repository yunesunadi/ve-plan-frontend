import { Component, inject, input, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell } from '@angular/material/table';
import { EventRegisterService } from '../../services/event-register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RegisterApprovalDialogComponent } from '../../components/register-approval-dialog/register-approval-dialog.component';
import { AsyncPipe } from '@angular/common';
import { UtilService } from '../../services/util.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { PageQuery } from '../../models/Utils';
import { PageEvent } from '@angular/material/paginator';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { EmailDeliveryStatusComponent } from '../../components/email-delivery-status/email-delivery-status.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { ApiError } from '../../models/ApiError';
import { Event } from '../../models/Event';

interface RegisteredUserRow {
  id: number;
  name: string;
  email: string;
  event_title: string;
  user_id: string;
  event_id: string;
  register_approved: boolean;
}

@Component({
    selector: 'app-registered-users',
    templateUrl: './registered-users.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './registered-users.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, DataTableComponent, StatusChipComponent, MatButton, MatIcon, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, AsyncPipe, EmailDeliveryStatusComponent]
})
export class RegisteredUsersComponent {
  @ViewChild(EmailDeliveryStatusComponent) emailStatus?: EmailDeliveryStatusComponent;

  event = input.required<Event>();
  private event$ = toObservable(this.event);

  role = signal("");

  readonly PAGE_LIMIT = 10;

  total = signal(0);
  tableLoading = signal(true);
  tableError = signal<ApiError | null>(null);
  selection: RegisteredUserRow[] = [];

  refresh$ = new BehaviorSubject(null);

  private eventRegisterService = inject(EventRegisterService);
  util = inject(UtilService);
  private aroute = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private dashboardCache = inject(DashboardCacheService);

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

  registered_users$ = this.refresh$.pipe(
    tap(() => {
      this.tableLoading.set(true);
      this.tableError.set(null);
    }),
    switchMap(() => this.query$.pipe(
      switchMap((query) => this.event$.pipe(
        switchMap((event) => this.eventRegisterService.getAllByEventId(event._id, query).pipe(
          tap((res) => this.total.set(res.meta?.total ?? 0)),
          map((res): RegisteredUserRow[] => res.data.map((item, index) => ({
            id: index + 1 * ((+(query.offset as any) + 1) || 1),
            name: item.user.name,
            email: item.user.email,
            event_title: item.event.title,
            user_id: item.user._id,
            event_id: item.event._id,
            register_approved: item.register_approved,
          }))),
        )))
      ),
      tap(() => this.tableLoading.set(false)),
      catchError((err: ApiError) => {
        this.tableLoading.set(false);
        this.tableError.set(err);
        return of([] as RegisteredUserRow[]);
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

  sendApproval(rows: RegisteredUserRow[]) {
    const dialogRef = this.dialog.open(RegisterApprovalDialogComponent, {
      data: rows.filter(item => !item.register_approved),
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
    this.router.navigate([`/${this.role()}/dashboard/events/${event_id}/registered_users`], {
      queryParams: { ...query, search: search || undefined, offset: undefined },
      replaceUrl: true
    });
  }

  handlePageChange(event: PageEvent, query: Partial<PageQuery>, event_id: string) {
    const offset = event.pageIndex ? (event.pageIndex * this.PAGE_LIMIT) : undefined;
    this.router.navigate([`/${this.role()}/dashboard/events/${event_id}/registered_users`], {
      queryParams:{ ...query, offset, limit: this.PAGE_LIMIT },
      replaceUrl: true
    });
  }

  isRowSelectable = (row: RegisteredUserRow) => !row.register_approved;

}
