import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EventRegisterService } from '../../services/event-register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of, shareReplay, switchMap, tap } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { RegisterApprovalDialogComponent } from '../../components/register-approval-dialog/register-approval-dialog.component';
import { Location } from '@angular/common';
import { EventService } from '../../services/event.service';
import { UtilService } from '../../services/util.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { Query } from '../../models/EventRegister';

@Component({
  standalone: false,
  selector: 'app-registered-users',
  templateUrl: './registered-users.component.html',
  styleUrl: './registered-users.component.scss'
})
export class RegisteredUsersComponent {
  @ViewChild("input") input!: ElementRef;
  
  displayedColumns: string[] = ['select', 'id', 'name', 'register_approved'];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  role!: string;

  readonly PAGE_LIMIT = 10;

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
      map(res => res.data)
    )),
    shareReplay(1)
  );

  query$ =  this.aroute.queryParams.pipe(
    switchMap((query) => {
      let qry = <Partial<Query>>{};

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

  registered_users$ = this.query$.pipe(
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
    tap((event_registers) => {
      this.dataSource = new MatTableDataSource(event_registers);
    }),
    shareReplay(1)
  );

  all_registered_users$ = this.event$.pipe(
    switchMap((event) => this.eventRegisterService.getAllByEventId(event._id).pipe(
      map((res) => res.data)
    ))
  );

  constructor() {}

  ngOnInit() {
    this.registered_users$.subscribe();

    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role = res.role;
      }
    });
  }

  isDisabled() {
    return this.dataSource.data.every((item) => item.register_approved);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data.filter(item => !item.register_approved));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  sendApproval() {
    const dialogRef = this.dialog.open(RegisterApprovalDialogComponent, {
      data: this.selection.selected.filter(item => !item.register_approved),
      width: "500px",
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe({
      next: (fetched) => {
        if (fetched) {
          this.registered_users$.subscribe();
          this.selection.deselect(...this.dataSource.data);
          this.selection.clear();
          this.input.nativeElement.value = "";
        }
      }
    });
  }

  handlePageChange(event: any, query: Partial<Query>, event_id: string) {
    const offset = event.pageIndex ? (event.pageIndex * this.PAGE_LIMIT) : undefined;
    this.router.navigate([`/${this.role}/dashboard/events/${event_id}/registered_users`], {
      queryParams:{ ...query, offset, limit: this.PAGE_LIMIT }
    });
  }

}