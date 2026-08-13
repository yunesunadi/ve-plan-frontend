import { Component, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { EventCategoryType, EventQuery, EventTimeType } from '../../models/Event';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { Router, RouterLink } from '@angular/router';
import { EventCacheService } from '../../caches/event-cache.service';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatInput, MatPrefix, MatSuffix, MatHint } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardActions } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrl: './events.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [
        provideNativeDateAdapter(),
        {
            provide: MAT_DATE_LOCALE,
            useValue: "en-GB"
        },
    ],
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatBadge, MatIcon, MatAccordion, MatExpansionPanel, MatFormField, MatLabel, MatInput, ReactiveFormsModule, FormsModule, MatPrefix, MatIconButton, MatSuffix, MatSelect, MatOption, MatDatepickerInput, MatHint, MatDatepickerToggle, MatDatepicker, MatCard, MatCardTitle, MatCardSubtitle, MatCardActions, RouterLink, AsyncPipe]
})
export class EventsComponent {
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  private isAccordionOpened = false;

  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  cache = inject(EventCacheService);

  readonly LIMIT = 5;

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

  goPrev(query: Partial<EventQuery>) {
    this.router.navigate([`/${this.role()}/dashboard/events`], {
      queryParams: { ...query, offset: +(query.offset || 0) - this.LIMIT },
      replaceUrl: true
    });
  }

  goNext(query: Partial<EventQuery>) {
    this.router.navigate([`/${this.role()}/dashboard/events`], {
      queryParams: { ...query, offset: +(query.offset || 0) + this.LIMIT },
      replaceUrl: true
    });
  }

  toggleAccordion() {
    this.isAccordionOpened ? this.accordion.closeAll() : this.accordion.openAll();
    this.isAccordionOpened = !this.isAccordionOpened;
  }

}
