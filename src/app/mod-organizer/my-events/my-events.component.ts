import { Component, inject, signal, ChangeDetectionStrategy, afterNextRender } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { Router, NavigationStart, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { EventCacheService } from '../../caches/event-cache.service';
import { Event, MyEventQuery, MyEventType } from '../../models/Event';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { StatusKind } from '../../shared/ui/status-chip/status-chip.component';
import { UtilService } from '../../services/util.service';

const SCROLL_KEY = 'my_events_scroll';

@Component({
    selector: 'app-my-events',
    templateUrl: './my-events.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './my-events.component.scss',
    imports: [PageHeaderComponent, InfiniteScrollDirective, MatButtonToggleGroup, ReactiveFormsModule, FormsModule, MatButtonToggle, MatButton, RouterLink, AsyncPipe, EventCardComponent, SkeletonComponent, EmptyStateComponent, ErrorStateComponent]
})
export class MyEventsComponent {
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  private util = inject(UtilService);
  cache = inject(EventCacheService);

  readonly LIMIT = 5;
  readonly skeletonPlaceholders = Array.from({ length: this.LIMIT });

  types: MyEventType[] = ["all", "public", "private"];
  role = signal("");

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart), takeUntilDestroyed())
      .subscribe(() => {
        const container = this.mainContent();
        if (container) sessionStorage.setItem(SCROLL_KEY, `${container.scrollTop}`);
      });

    afterNextRender(() => this.restoreScroll());
  }

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role.set(res.role);
      }
    });
  }

  ngOnDestroy() {
    this.cache.changeRoute$.next(true);
  }

  private mainContent(): HTMLElement | null {
    return document.querySelector<HTMLElement>('#main-content');
  }

  private restoreScroll(): void {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (!saved) return;
    sessionStorage.removeItem(SCROLL_KEY);

    const target = Number(saved);
    if (!target || Number.isNaN(target)) return;

    let frames = 0;
    const tick = () => {
      const container = this.mainContent();
      if (!container) {
        if (frames++ < 30) requestAnimationFrame(tick);
        return;
      }
      if (container.scrollHeight - container.clientHeight >= target || frames++ > 30) {
        container.scrollTop = target;
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  changeFilter(value: string, query: Partial<MyEventQuery>) {
    this.cache.resetMyEventsQuery$.next(true);

    this.router.navigate([`/${this.role()}/dashboard/my_events`], {
      queryParams: { ...query, type: value, offset: 0 },
      replaceUrl: true
    });
  }

  onScroll(query: Partial<MyEventQuery>, result_length: number) {
    if (result_length >= this.cache.myEventsTotal()) return;
    if (this.cache.isMyEventsLoadingMore() || this.cache.myEventsLoadMoreError()) return;
    this.cache.loadMoreMyEvents({ ...query, offset: result_length });
  }

  retryLoadMore(query: Partial<MyEventQuery>, result_length: number) {
    this.cache.loadMoreMyEvents({ ...query, offset: result_length });
  }

  retry() {
    this.cache.retryMyEvents();
  }

  eventStatus(event: Event): StatusKind {
    if (this.util.is_event_expired(event)) return 'past';

    const start = event.starts_at ? new Date(event.starts_at) : this.legacyStart(event);
    return start.getTime() > Date.now() ? 'upcoming' : 'happening';
  }

  private legacyStart(event: Event): Date {
    const date = new Date(event.date);
    const time = new Date(event.start_time);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
  }
}
