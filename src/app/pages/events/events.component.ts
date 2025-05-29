import { Component, inject } from '@angular/core';
import { EventService } from '../../services/event.service';
import { BehaviorSubject, map, shareReplay, switchMap } from 'rxjs';
import { Event, EventQuery } from '../../models/Event';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

const LIMIT = 5; 

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
  private eventService = inject(EventService);
  private cacheService = inject(DashboardCacheService);

  query$ = new BehaviorSubject<EventQuery>(<EventQuery>{ limit: LIMIT });
  events$ = new BehaviorSubject<Event[]>([]);
  times = ["upcoming", "happening", "past"];
  categories = ["conference", "meetup", "webinar"];

  role$ = this.cacheService.has_role.pipe(
    map((res) => res.role),
  );

  constructor() {}

  ngOnInit() {
    this.query$.pipe(
      switchMap((query) => this.eventService.getAllByQuery(query).pipe(
        map(res => res.data),
        map((res): [EventQuery, Event[]] => [query, res]),
        shareReplay(1)
      ))
    ).subscribe({
      next: ([query, events]) => {
        if (query.offset) {
          this.events$.next([
            ...this.events$.value,
            ...events
          ]);
        } else {
          this.events$.next(events);
        }
      }
    });
  }

  changeFilter(type: string, value: string) {
    this.query$.next({
      ...this.query$.value,
      [type]: value,
      offset: 0,
    });
  }

  clearFilter(type: string) {
    this.query$.next({
      ...this.query$.value,
      [type]: "",
      offset: 0,
    });
  }
  
  onScroll() {
    this.query$.next({
      ...this.query$.value,
      limit: LIMIT,
      offset: this.events$.value.length,
    });
  }

}
