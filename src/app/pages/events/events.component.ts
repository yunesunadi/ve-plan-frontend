import { Component, inject } from '@angular/core';
import { EventQuery } from '../../models/Event';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { EventCacheService } from '../../caches/event-cache.service';
import { ViewportScroller } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_LOCALE,
      useValue: "en-GB"
    },
  ]
})
export class EventsComponent {
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  cache = inject(EventCacheService);

  times = ["upcoming", "happening", "past"];
  categories = ["conference", "meetup", "webinar"];
  role!: string;

  viewportScroller = inject(ViewportScroller);

  constructor() { }

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role = res.role;
      }
    });
  }

  changeFilter(type: string, value: string, query: Partial<EventQuery>) {
    this.router.navigate([`/${this.role}/dashboard/events`], {
      queryParams: { ...query, [type]: value, offset: 0 }
    });
  }

  clearFilter(type: string, query: Partial<EventQuery>) {
    this.cache.resetQuery$.next(true);
    
    delete query[type as keyof EventQuery];
    this.router.navigate([`/${this.role}/dashboard/events`], {
      queryParams: { ...query, offset: 0 }
    });
  }
  
  onScroll(query: Partial<EventQuery>, result_length: number) {
    this.router.navigate([`/${this.role}/dashboard/events`], {
      queryParams: { ...query, offset: result_length }
    });
  }

}
