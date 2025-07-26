import { Component, inject, ViewChild } from '@angular/core';
import { EventQuery } from '../../models/Event';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { EventCacheService } from '../../caches/event-cache.service';
import { MatAccordion } from '@angular/material/expansion';

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
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  private isAccordionOpened = false;

  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  cache = inject(EventCacheService);

  readonly LIMIT = 5;

  times = ["upcoming", "happening", "past"];
  categories = ["conference", "meetup", "webinar"];
  role!: string;

  constructor() { }

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role = res.role;
      }
    });
  }

  getBadgeCount(query: Partial<EventQuery>) {
    let count = 0;
    const values = Object.keys(query);

    if (values.includes("search_value")) {
      count++;
    }

    if (values.includes("time")) {
      count++;
    }

    if (values.includes("category")) {
      count++;
    }

    if (values.includes("date")) {
      count++;
    }

    return count;
  }

  changeFilter(type: string, value: string, query: Partial<EventQuery>) {
    if (type === "date") {
      value = new Date(value).toISOString();
    }

    this.router.navigate([`/${this.role}/dashboard/events`], {
      queryParams: { ...query, [type]: value, offset: 0 },
      replaceUrl: true
    });
  }

  clearFilter(type: string, query: Partial<EventQuery>) {
    this.cache.resetQuery$.next(true);
    
    delete query[type as keyof EventQuery];
    this.router.navigate([`/${this.role}/dashboard/events`], {
      queryParams: { ...query, offset: 0 },
      replaceUrl: true
    });
  }

  goPrev(query: Partial<EventQuery>) {
    this.router.navigate([`/${this.role}/dashboard/events`], {
      queryParams: { ...query, offset: +(query.offset || 0) - this.LIMIT },
      replaceUrl: true
    });
  }

  goNext(query: Partial<EventQuery>) {
    this.router.navigate([`/${this.role}/dashboard/events`], {
      queryParams: { ...query, offset: +(query.offset || 0) + this.LIMIT },
      replaceUrl: true
    });
  }

  toggleAccordion() {
    this.isAccordionOpened ? this.accordion.closeAll() : this.accordion.openAll();
    this.isAccordionOpened = !this.isAccordionOpened;
  }

}
