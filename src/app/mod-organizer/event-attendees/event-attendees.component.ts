import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { combineLatest, map, shareReplay, switchMap } from 'rxjs';
import { MeetingStartedDialogComponent } from '../../components/meeting-started-dialog/meeting-started-dialog.component';
import { Location } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-event-attendees',
  templateUrl: './event-attendees.component.html',
  styleUrl: './event-attendees.component.scss'
})
export class EventAttendeesComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild("input") input!: ElementRef;
  
  displayedColumns: string[] = ['select', 'id', 'name', 'meeting_started'];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);

  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private aroute = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  location = inject(Location);

  constructor() {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    combineLatest([
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
      
        return unique_users.map((item, index) => ({
          id: index + 1,
          name: item.user.name,
          email: item.user.email,
          event_title: item.event.title,
          user_id: item.user._id,
          event_id: item.event._id,
          meeting_started: item.meeting_started,
          type: item.type
        }));
      })
    ).subscribe({
      next: (event_attendees) => {
        this.dataSource = new MatTableDataSource(event_attendees);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
          this.fetchData();
          this.selection.deselect(...this.dataSource.data);
          this.selection.clear();
          this.input.nativeElement.value = "";
        }
      }
    });
  }
}
