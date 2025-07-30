import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EventRegisterService } from '../../services/event-register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { RegisterApprovalDialogComponent } from '../../components/register-approval-dialog/register-approval-dialog.component';
import { Location } from '@angular/common';
import { EventService } from '../../services/event.service';
import { UtilService } from '../../services/util.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { PageQuery } from '../../models/Utils';
import { PageEvent } from '@angular/material/paginator';

@Component({
  standalone: false,
  selector: 'app-registered-users',
  templateUrl: './registered-users.component.html',
  styleUrl: './registered-users.component.scss'
})
export class RegisteredUsersComponent {
  @ViewChild("input") input!: ElementRef;
  
  displayedColumns: string[] = ['select', 'id', 'name', 'register_approved'];
  selection = new SelectionModel<any>(true, []);
  role = signal("");
  isLoading = signal(true);

  readonly PAGE_LIMIT = 10;

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

  all_registered_users$ = this.event$.pipe(
    switchMap((event) => this.eventRegisterService.getAllByEventId(event._id).pipe(
      map((res) => res.data)
    ))
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