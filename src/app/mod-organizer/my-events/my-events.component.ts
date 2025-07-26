import { Component, inject } from '@angular/core';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { Router } from '@angular/router';
import { EventCacheService } from '../../caches/event-cache.service';
import { MyEventQuery } from '../../models/Event';

@Component({
  standalone: false,
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss'
})
export class MyEventsComponent {
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  cache = inject(EventCacheService);

  readonly LIMIT = 5;

  types = ["all", "public", "private"];
  role!: string;

  constructor() {}

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role = res.role;
      }
    });
  }
  
  changeFilter(value: string, query: Partial<MyEventQuery>) {
    this.cache.resetMyEventsQuery$.next(true);
    
    this.router.navigate([`/${this.role}/dashboard/my_events`], {
      queryParams: { ...query, type: value, offset: 0 },
      replaceUrl: true
    });
  }

  onScroll(query: Partial<MyEventQuery>, result_length: number) {
    this.router.navigate([`/${this.role}/dashboard/my_events`], {
       queryParams: { ...query, offset: result_length },
       replaceUrl: true
     });
  }
}
