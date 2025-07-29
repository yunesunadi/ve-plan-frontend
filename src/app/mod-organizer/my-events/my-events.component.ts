import { Component, inject } from '@angular/core';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { EventCacheService } from '../../caches/event-cache.service';
import { MyEventQuery, MyEventType } from '../../models/Event';

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

  types: MyEventType[] = ["all", "public", "private"];
  role!: string;

  constructor() {
    this.router.events.subscribe(event => {
      const container = document.querySelector('.my-events-container') as HTMLElement;

      if (event instanceof NavigationStart) {
        if (container) {
          localStorage.setItem('my_events_scroll', `${container.scrollTop}`);
        }
      }

      if (event instanceof NavigationEnd) {
        const scrollY = localStorage.getItem('my_events_scroll');

        if (container && scrollY) {
          setTimeout(() => {
            container.scrollTop = +scrollY;
            localStorage.removeItem('my_events_scroll');
          }, 0);
        }
      }
    });
  }

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role = res.role;
      }
    });
  }

  ngOnDestroy() {
    this.cache.changeRoute$.next(true);
  }
  
  changeFilter(value: string, query: Partial<MyEventQuery>) {
    this.cache.resetMyEventsQuery$.next(true);
    
    this.router.navigate([`/${this.role}/dashboard/my_events`], {
      queryParams: { ...query, type: value, offset: 0 },
      replaceUrl: true
    });
  }

  onScroll(query: Partial<MyEventQuery>, result_length: number) {
    const new_query = { ...query, offset: result_length };
    this.cache.loadMoreMyEvents(new_query);
  }
}
