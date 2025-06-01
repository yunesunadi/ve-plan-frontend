import { inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, filter, map, Observable, of, scan, shareReplay, switchMap, tap } from 'rxjs';
import { Event, EventQuery, MyEventQuery } from '../models/Event';
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

  query$ = this.activatedRoute.queryParams.pipe(
    filter(() => location.href.includes("dashboard/events")),
    switchMap((query) => {
      let qry = <Partial<EventQuery>>{};

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
      let qry = <Partial<MyEventQuery>>{};

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
      this.cache.events$ = this.query$.pipe(
        switchMap((query) => this.eventService.getAllByQuery(query).pipe(
          map((res) => res.data)
        )),
        tap(() => {
          this.resetQuery$.next(false);
        }),
        shareReplay(1)
      );
    }

    return this.cache.events$;
  }

  get my_events() {
    if (!this.cache.my_events$) {
      this.cache.my_events$ = this.my_query$.pipe(
        switchMap((query) => this.eventService.getMyEvents(query).pipe(
          map(res => ({ data: res.data, query })),
        )),
        scan((acc: Event[], { data, query }) => {
          if (this.resetMyEventsQuery$.value) return data;
          return query.offset ? [...acc, ...data] : data;
        }, []),
        tap(() => {
          this.resetMyEventsQuery$.next(false);
        }),
        shareReplay(1)
      );
    }

    return this.cache.my_events$;
  }

  reset() {
    this.cache.events$ = null;
    this.cache.my_events$ = null;
  }

}
