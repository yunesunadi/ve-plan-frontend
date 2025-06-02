import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { combineLatest, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { MeetingStartedDialogComponent } from '../../components/meeting-started-dialog/meeting-started-dialog.component';
import { Location } from '@angular/common';
import { PageQuery } from '../../models/Utils';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { UtilService } from '../../services/util.service';
import { EventService } from '../../services/event.service';

@Component({
  standalone: false,
  selector: 'app-event-attendees',
  templateUrl: './event-attendees.component.html',
  styleUrl: './event-attendees.component.scss'
})
export class EventAttendeesComponent {
  @ViewChild("input") input!: ElementRef;
  
  displayedColumns: string[] = ['select', 'id', 'name', 'meeting_started'];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  role!: string;
  data_length!: number;

  readonly PAGE_LIMIT = 10;

  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private eventService = inject(EventService);
  private dashboardCache = inject(DashboardCacheService);
  private aroute = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  location = inject(Location);
  util = inject(UtilService);

  event$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventService.getOneById(params.id).pipe(
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

  event_attendees$ = this.query$.pipe(
    switchMap((query: any) => combineLatest([
      this.aroute.params.pipe(
        switchMap((params: any) => this.eventRegisterService.getAllApprovedByEventId(params.id)),
        map((res) => res.data.map((item => ({ ...item, type: "registered" }))))
      ),
      this.aroute.params.pipe(
        switchMap((params: any) => this.eventInviteService.getAllAcceptedByEventId(params.id)),
        map((res) => res.data.map((item => ({ ...item, type: "invitation_approved" }))))
      )
    ]).pipe(
      map((res) => {
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

        this.data_length = result.length;

        const paginated_result = result.slice(query.offset || 0, (query.offset || 0) + query.limit);

        return paginated_result;
      }))
    ),
    tap((event_attendees) => {
      this.dataSource = new MatTableDataSource(event_attendees);
    }),
    shareReplay(1)
  );

  constructor() {}

  ngOnInit() {
    this.event_attendees$.subscribe();

    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role = res.role;
      }
    });
  }

  isDisabled() {
    return this.dataSource.data.every((item) => item.meeting_started);
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

    this.selection.select(...this.dataSource.data.filter(item => !item.meeting_started));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  send() {
    const dialogRef = this.dialog.open(MeetingStartedDialogComponent, {
      data: this.selection.selected.filter(item => !item.meeting_started),
      width: "500px",
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe({
      next: (fetched) => {
        if (fetched) {
          this.event_attendees$.subscribe();
          this.selection.deselect(...this.dataSource.data);
          this.selection.clear();
          this.input.nativeElement.value = "";
        }
      }
    });
  }

  handlePageChange(event: any, query: Partial<PageQuery>, event_id: string) {
    const offset = event.pageIndex ? (event.pageIndex * this.PAGE_LIMIT) : undefined;
    this.router.navigate([`/${this.role}/dashboard/events/${event_id}/meeting/attendees`], {
      queryParams:{ ...query, offset, limit: this.PAGE_LIMIT }
    });
  }
  
}
