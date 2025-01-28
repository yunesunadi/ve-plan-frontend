import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EventRegisterService } from '../../../services/event-register.service';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-registered-users',
  templateUrl: './registered-users.component.html',
  styleUrl: './registered-users.component.scss'
})
export class RegisteredUsersComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = ['id', 'name', 'register_completed'];
  dataSource: MatTableDataSource<any>;

  private eventRegisterService = inject(EventRegisterService);
  private aroute = inject(ActivatedRoute);

  constructor() {
    this.dataSource = new MatTableDataSource([] as any);
  }

  ngOnInit() {
    this.aroute.params.pipe(
      switchMap((params: any) => this.eventRegisterService.getAll(params.id)),
      map((res) => res.data.map((item, index) => ({
        id: index + 1,
        name: item.user.name,
        register_completed: item.register_completed,
      })))
    ).subscribe({
      next: (event_registers) => {
        this.dataSource = new MatTableDataSource(event_registers);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}