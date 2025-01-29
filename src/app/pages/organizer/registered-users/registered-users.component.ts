import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EventRegisterService } from '../../../services/event-register.service';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { EmailService } from '../../../services/email.service';

@Component({
  standalone: false,
  selector: 'app-registered-users',
  templateUrl: './registered-users.component.html',
  styleUrl: './registered-users.component.scss'
})
export class RegisteredUsersComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = ['select', 'id', 'name', 'register_approved'];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);

  private eventRegisterService = inject(EventRegisterService);
  private aroute = inject(ActivatedRoute);
  private emailService = inject(EmailService);

  constructor() {}

  ngOnInit() {
    this.aroute.params.pipe(
      switchMap((params: any) => this.eventRegisterService.getAll(params.id)),
      map((res) => res.data.map((item, index) => ({
        id: index + 1,
        name: item.user.name,
        email: item.user.email,
        event_title: item.event.title,
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

 

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  sendApproval() {
    this.selection.selected.forEach((item) => {
      this.emailService.send(item.email, item.name, item.event_title).subscribe(
      () => {
        console.log("send email successfully");
      });
    });
  }
}