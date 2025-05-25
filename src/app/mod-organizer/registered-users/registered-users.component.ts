import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EventRegisterService } from '../../services/event-register.service';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { RegisterApprovalDialogComponent } from '../../components/register-approval-dialog/register-approval-dialog.component';
import { Location } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-registered-users',
  templateUrl: './registered-users.component.html',
  styleUrl: './registered-users.component.scss'
})
export class RegisteredUsersComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild("input") input!: ElementRef;
  
  displayedColumns: string[] = ['select', 'id', 'name', 'register_approved'];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);

  private eventRegisterService = inject(EventRegisterService);
  private aroute = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  location = inject(Location);

  constructor() {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.aroute.params.pipe(
      switchMap((params: any) => this.eventRegisterService.getAllByEventId(params.id)),
      map((res) => res.data.map((item, index) => ({
        id: index + 1,
        name: item.user.name,
        email: item.user.email,
        event_title: item.event.title,
        user_id: item.user._id,
        event_id: item.event._id,
        register_approved: item.register_approved,
      })))
    ).subscribe({
      next: (event_registers) => {
        this.dataSource = new MatTableDataSource(event_registers);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
          this.fetchData();
          this.selection.deselect(...this.dataSource.data);
          this.selection.clear();
          this.input.nativeElement.value = "";
        }
      }
    });
  }
}