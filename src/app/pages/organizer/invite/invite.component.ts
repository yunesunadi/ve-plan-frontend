import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { concatMap, debounceTime, iif, map, of, switchMap } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { FormControl, FormGroup } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { InvitationSentDialogComponent } from '../../../components/invitation-sent-dialog/invitation-sent-dialog.component';
import { InvitedUsersDialogComponent } from '../../../components/invited-users-dialog/invited-users-dialog.component';
import { AcceptedUsersDialogComponent } from '../../../components/accepted-users-dialog/accepted-users-dialog.component';

@Component({
  standalone: false,
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.scss'
})
export class InviteComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = ['select', 'id', 'name'];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  form = new FormGroup({
    search_input: new FormControl()
  });

  private userService = inject(UserService);
  private eventService = inject(EventService);
  private aroute = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  event$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventService.getOneById(params.id).pipe(
      map((res) => res.data)
    )),
  );

  constructor() {}

  ngOnInit() {
    this.form.controls.search_input.valueChanges.pipe(
      debounceTime(500),
      switchMap((value) => iif(
        () => !!value,
        this.userService.getAttendees(value).pipe(
          concatMap((users) => this.event$.pipe(
            map((event) => (users.data.map((item) => ({ ...item, event_id: event._id, event_title: event.title }))))
          ))
        ),
        of([])
      )),
      map((res) => res.map((item, index) => ({
        id: index + 1,
        name: item.name,
        email: item.email,
        event_title: item.event_title,
        user_id: item._id,
        event_id: item.event_id,
      })))
    ).subscribe({
      next: (users) => {
        this.dataSource = new MatTableDataSource(users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
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

    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  sendInvitation() {
    const dialogRef = this.dialog.open(InvitationSentDialogComponent, {
      data: this.selection.selected,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
        this.selection.deselect(...this.dataSource.data);
        this.selection.clear();

        this.dataSource = new MatTableDataSource([] as any);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  openInvitedUsersDialog(event_id: string) {
    this.dialog.open(InvitedUsersDialogComponent, {
      data: {
        id: event_id
      }
    });
  }

  openAcceptedUsersDialog(event_id: string) {
    this.dialog.open(AcceptedUsersDialogComponent, {
      data: {
        id: event_id
      }
    });
  }
}
