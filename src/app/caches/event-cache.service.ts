import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, filter, map, Observable, of, scan, shareReplay, switchMap, tap, merge } from 'rxjs';
import { Event, EventQuery, MyEventQuery } from '../models/Event';
import { ApiError } from '../models/ApiError';
import { EventService } from '../services/event.service';

const LIMIT = 5;

interface Cache {
  events$: Observable<Event[]> | null;
  my_events$: Observable<Event[]> | null;
}

@Injectable({
  providedIn: 'root'
})
export class EventCacheService {
  
  private eventService = inject(EventService);
  private activatedRoute = inject(ActivatedRoute);

  cache = <Cache>{};
  resetQuery$ = new BehaviorSubject(false);
  resetMyEventsQuery$ = new BehaviorSubject(false);
  changeRoute$ = new BehaviorSubject(false);
  myEventsPagination$ = new BehaviorSubject<Partial<MyEventQuery> | null>(null);

  isEventsLoading = signal(true);
  isMyEventsLoading = signal(true);

  eventsTotal = signal(0);
  myEventsTotal = signal(0);

  eventsError = signal<ApiError | null>(null);
  myEventsError = signal<ApiError | null>(null);

  private retryEvents$ = new BehaviorSubject(0);
  private retryMyEvents$ = new BehaviorSubject(0);
  private lastEventsQuery: Partial<EventQuery> = { limit: LIMIT };
  private lastMyQuery: Partial<MyEventQuery> = { type: 'all', limit: LIMIT };

  query$ = this.activatedRoute.queryParams.pipe(
    filter(() => location.href.includes("dashboard/events")),
    switchMap((query) => {
      let qry: Partial<EventQuery>;

      if (Object.keys(query).length > 0) {
        qry = Object.fromEntries(new URLSearchParams(query));
      } else {
        qry = {
          limit: LIMIT
        };
      }

      return of(qry);
    }),
    shareReplay(1)
  );

  my_query$ = this.activatedRoute.queryParams.pipe(
    filter(() => location.href.includes("dashboard/my_events")),
    switchMap((query) => {
      let qry: Partial<MyEventQuery>;

      if (Object.keys(query).length > 0) {
        qry = Object.fromEntries(new URLSearchParams(query));
      } else {
        qry = {
          type: "all",
          limit: LIMIT
        };
      }

      return of(qry);
    }),
    shareReplay(1)
  );

  constructor() { }

  get events() {
    if (!this.cache.events$) {
      this.cache.events$ = merge(this.query$, this.retryEvents$.pipe(filter((n) => n > 0), map(() => this.lastEventsQuery))).pipe(
        tap((query) => { this.lastEventsQuery = query; }),
        switchMap((query) => this.eventService.getAllByQuery(query).pipe(
          tap((res) => {
            this.isEventsLoading.set(false);
            this.eventsTotal.set(res.meta?.total ?? 0);
            this.eventsError.set(null);
          }),
          map((res) => res.data),
          catchError((err: unknown) => {
            this.isEventsLoading.set(false);
            this.eventsError.set(err instanceof ApiError ? err : null);
            return of([] as Event[]);
          })
        )),
        tap(() => {
          this.resetQuery$.next(false);
        }),
        shareReplay(1)
      );
    }

    return this.cache.events$;
  }

  retryEvents(): void {
    this.isEventsLoading.set(true);
    this.eventsError.set(null);
    this.retryEvents$.next(this.retryEvents$.value + 1);
  }

  get my_events() {
    if (!this.cache.my_events$) {
      const retryQuery$ = this.retryMyEvents$.pipe(
        filter((n) => n > 0),
        map(() => ({ ...this.lastMyQuery, offset: 0 }))
      );

      const allQueries$ = merge(
        this.my_query$.pipe(tap((query) => { this.lastMyQuery = query; })),
        this.myEventsPagination$.pipe(filter(query => query !== null)),
        retryQuery$
      );

      this.cache.my_events$ = allQueries$.pipe(
        switchMap((query) => this.eventService.getMyEvents(query).pipe(
          tap((res) => {
            this.isMyEventsLoading.set(false);
            this.myEventsTotal.set(res.meta?.total ?? 0);
            this.myEventsError.set(null);
          }),
          map(res => ({ data: res.data, query })),
          catchError((err: unknown) => {
            this.isMyEventsLoading.set(false);
            this.myEventsError.set(err instanceof ApiError ? err : null);
            return of({ data: [] as Event[], query });
          })
        )),
        scan((acc: Event[], { data, query }) => {
          if (this.resetMyEventsQuery$.value) return data;
          if (this.changeRoute$.value) return acc;
          return query.offset ? [...acc, ...data] : data;
        }, []),
        tap(() => {
          this.resetMyEventsQuery$.next(false);
          this.changeRoute$.next(false);
        }),
        shareReplay(1)
      );
    }

    return this.cache.my_events$;
  }

  loadMoreMyEvents(query: Partial<MyEventQuery>) {
    this.myEventsPagination$.next(query);
  }

  retryMyEvents(): void {
    this.isMyEventsLoading.set(true);
    this.myEventsError.set(null);
    this.retryMyEvents$.next(this.retryMyEvents$.value + 1);
  }

  reset() {
    this.cache.events$ = null;
    this.cache.my_events$ = null;
  }

}
