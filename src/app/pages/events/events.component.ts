import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { EventCategoryType, EventQuery, EventTimeType } from '../../models/Event';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { EventCacheService } from '../../caches/event-cache.service';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { AsyncPipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';

interface FilterChip {
  type: keyof EventQuery;
  label: string;
}

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrl: './events.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        provideNativeDateAdapter(),
        {
            provide: MAT_DATE_LOCALE,
            useValue: "en-GB"
        },
    ],
    imports: [OutletInnerComponent, PageHeaderComponent, MatButton, MatIcon, MatFormField, MatInput, FormsModule, MatPrefix, MatIconButton, MatSuffix, MatMenu, MatMenuItem, MatMenuTrigger, MatDatepicker, MatDatepickerInput, MatPaginator, AsyncPipe, EventCardComponent, SkeletonComponent, EmptyStateComponent, ErrorStateComponent]
})
export class EventsComponent {
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  cache = inject(EventCacheService);

  readonly LIMIT = 5;
  readonly skeletonPlaceholders = Array.from({ length: this.LIMIT });

  times: EventTimeType[] = ["upcoming", "happening", "past"];
  categories: EventCategoryType[] = ["conference", "meetup", "webinar"];
  role = signal("");

  constructor() { }

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role.set(res.role);
      }
    });
  }

  activeFilters(query: Partial<EventQuery>): FilterChip[] {
    const chips: FilterChip[] = [];

    if (query.search_value) {
      chips.push({ type: "search_value", label: `Name: ${query.search_value}` });
    }
    if (query.time) {
      chips.push({ type: "time", label: `Time: ${this.titleCase(query.time)}` });
    }
    if (query.category) {
      chips.push({ type: "category", label: `Category: ${this.titleCase(query.category)}` });
    }
    if (query.date) {
      chips.push({ type: "date", label: `Date: ${this.formatDate(query.date)}` });
    }

    return chips;
  }

  protected titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  protected formatDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? iso
      : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  private dateModel: { key: string; value: Date | null } = { key: '', value: null };

  protected selectedDate(query: Partial<EventQuery>): Date | null {
    const key = query.date ?? '';
    if (key !== this.dateModel.key) {
      const date = key ? new Date(key) : null;
      this.dateModel = {
        key,
        value: date && !Number.isNaN(date.getTime()) ? date : null,
      };
    }
    return this.dateModel.value;
  }

  protected onDateChange(date: Date | null, query: Partial<EventQuery>): void {
    if (date) {
      this.changeFilter("date", date.toISOString(), query);
    }
  }

  changeFilter(type: string, value: string, query: Partial<EventQuery>) {
    value = value.trim();

    if (type === "date") {
      value = new Date(value).toISOString();
    }

    this.router.navigate([`/${this.role()}/dashboard/events`], {
      queryParams: { ...query, [type]: value, offset: 0 },
      replaceUrl: true
    });
  }

  clearFilter(type: string, query: Partial<EventQuery>) {
    this.cache.resetQuery$.next(true);

    delete query[type as keyof EventQuery];
    this.router.navigate([`/${this.role()}/dashboard/events`], {
      queryParams: { ...query, offset: 0 },
      replaceUrl: true
    });
  }

  clearAllFilters() {
    this.cache.resetQuery$.next(true);
    this.router.navigate([`/${this.role()}/dashboard/events`], { replaceUrl: true });
  }

  retry() {
    this.cache.retryEvents();
  }

  handlePageChange(event: PageEvent, query: Partial<EventQuery>) {
    this.router.navigate([`/${this.role()}/dashboard/events`], {
      queryParams: { ...query, offset: event.pageIndex ? event.pageIndex * this.LIMIT : 0 },
      replaceUrl: true
    });
  }

}
