import { Component, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { EventRegisterService } from '../../services/event-register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { RegisterApprovalDialogComponent } from '../../components/register-approval-dialog/register-approval-dialog.component';
import { Location, AsyncPipe } from '@angular/common';
import { EventService } from '../../services/event.service';
import { UtilService } from '../../services/util.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { PageQuery } from '../../models/Utils';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatLabel, MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { EmailDeliveryStatusComponent } from '../../components/email-delivery-status/email-delivery-status.component';

@Component({
    selector: 'app-registered-users',
    templateUrl: './registered-users.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './registered-users.component.scss',
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatIcon, MatFormField, MatPrefix, MatLabel, MatInput, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatPaginator, AsyncPipe, EmailDeliveryStatusComponent]
})
export class RegisteredUsersComponent {
  @ViewChild("input") input!: ElementRef;
  @ViewChild(EmailDeliveryStatusComponent) emailStatus?: EmailDeliveryStatusComponent;
  
  displayedColumns: string[] = ['select', 'id', 'name', 'register_approved'];
  selection = new SelectionModel<any>(true, []);
  role = signal("");
  isLoading = signal(true);

  readonly PAGE_LIMIT = 10;

  total = signal(0);

  refresh$ = new BehaviorSubject(null);

  private eventRegisterService = inject(EventRegisterService);
  private eventService = inject(EventService);
  util = inject(UtilService);
  private aroute = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private dashboardCache = inject(DashboardCacheService);
  location = inject(Location);

  event$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventService.getOneById(params.id).pipe(
      tap(() => this.isLoading.set(false)),
      map(res => res.data)
    )),
    shareReplay(1)
  );

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

  registered_users$ = this.refresh$.pipe(
    switchMap(() => this.query$.pipe(
      switchMap((query) => this.event$.pipe(
        switchMap((event) => this.eventRegisterService.getAllByEventId(event._id, query).pipe(
          tap((res) => this.total.set(res.meta?.total ?? 0)),
          map((res) => res.data.map((item, index) => ({
            id: index + 1 * ((+(query.offset as any) + 1) || 1),
            name: item.user.name,
            email: item.user.email,
            event_title: item.event.title,
            user_id: item.user._id,
            event_id: item.event._id,
            register_approved: item.register_approved,
          }))
        )))
      )),
      map((event_registers) => (new MatTableDataSource(event_registers)))
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

  isDisabled(dataSource: MatTableDataSource<any>) {
    return dataSource?.data?.every((item: any) => item.register_approved);
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  isAllSelected(dataSource: MatTableDataSource<any>) {
    const numSelected = this.selection.selected.length;
    const numRows = dataSource?.data?.length;
    return numSelected === numRows;
  }

  toggleAllRows(dataSource: MatTableDataSource<any>) {
    if (this.isAllSelected(dataSource)) {
      this.selection.clear();
      return;
    }

    this.selection.select(...dataSource?.data?.filter((item: any) => !item.register_approved));
  }

  checkboxLabel(dataSource: MatTableDataSource<any>, row?: any): string {
    if (!row) {
      return `${this.isAllSelected(dataSource) ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  sendApproval(dataSource: MatTableDataSource<any>) {
    const dialogRef = this.dialog.open(RegisterApprovalDialogComponent, {
      data: this.selection.selected.filter(item => !item.register_approved),
      width: "500px",
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe({
      next: (fetched) => {
        if (fetched) {
          this.refresh$.next(null);
          this.selection.deselect(...dataSource.data);
          this.selection.clear();
          this.input.nativeElement.value = "";
          this.emailStatus?.refresh();
          setTimeout(() => this.emailStatus?.refresh(), 6000);
        }
      }
    });
  }

  handlePageChange(event: PageEvent, query: Partial<PageQuery>, event_id: string) {
    const offset = event.pageIndex ? (event.pageIndex * this.PAGE_LIMIT) : undefined;
    this.router.navigate([`/${this.role()}/dashboard/events/${event_id}/registered_users`], {
      queryParams:{ ...query, offset, limit: this.PAGE_LIMIT },
      replaceUrl: true
    });
  }

}