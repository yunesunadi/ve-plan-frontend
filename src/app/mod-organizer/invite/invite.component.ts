import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { concatMap, debounceTime, iif, map, of, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { InvitationSentDialogComponent } from '../../components/invitation-sent-dialog/invitation-sent-dialog.component';
import { InvitedUsersDialogComponent } from '../../components/invited-users-dialog/invited-users-dialog.component';
import { AcceptedUsersDialogComponent } from '../../components/accepted-users-dialog/accepted-users-dialog.component';
import { Location, AsyncPipe } from '@angular/common';
import { UtilService } from '../../services/util.service';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatLabel, MatInput } from '@angular/material/input';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'app-invite',
    templateUrl: './invite.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invite.component.scss',
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatIcon, ReactiveFormsModule, MatFormField, MatPrefix, MatLabel, MatInput, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, AsyncPipe]
})
export class InviteComponent {
  displayedColumns: string[] = ['select', 'id', 'name'];
  selection = new SelectionModel<any>(true, []);
  form = new FormGroup({
    search_input: new FormControl()
  });

  private userService = inject(UserService);
  private eventService = inject(EventService);
  private aroute = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  location = inject(Location);
  util = inject(UtilService);

  isLoading = signal(true);

  event$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventService.getOneById(params.id).pipe(
      tap(() => this.isLoading.set(false)),
      map((res) => res.data)
    )),
    shareReplay(1)
  );

  dataSource$ = this.form.controls.search_input.valueChanges.pipe(
    debounceTime(500),
    switchMap((value) => iif(
      () => !!value && value.trim().length >= 2,
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
    }))),
    map((users) => new MatTableDataSource(users)),
    startWith(new MatTableDataSource<any>([])),
    shareReplay(1)
  );

  constructor() {}

  isAllSelected(dataSource: MatTableDataSource<any>) {
    const numSelected = this.selection.selected.length;
    const numRows = dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(dataSource: MatTableDataSource<any>) {
    if (this.isAllSelected(dataSource)) {
      this.selection.clear();
      return;
    }

    this.selection.select(...dataSource.data);
  }

  checkboxLabel(dataSource: MatTableDataSource<any>, row?: any): string {
    if (!row) {
      return `${this.isAllSelected(dataSource) ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  sendInvitation(dataSource: MatTableDataSource<any>) {
    const dialogRef = this.dialog.open(InvitationSentDialogComponent, {
      data: this.selection.selected,
      disableClose: true,
      width: "500px"
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
        this.selection.deselect(...dataSource.data);
        this.selection.clear();
        this.form.controls.search_input.setValue("");
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
}
