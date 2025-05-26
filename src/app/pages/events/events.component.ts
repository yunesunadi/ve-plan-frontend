import { Component, inject } from '@angular/core';
import { EventService } from '../../services/event.service';
import { BehaviorSubject, map, shareReplay, switchMap } from 'rxjs';
import { EventQuery } from '../../models/Event';

@Component({
  standalone: false,
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {
  private eventService = inject(EventService);

  query$ = new BehaviorSubject<EventQuery>(<EventQuery>{});
  times = ["upcoming", "happening", "past"];
  categories = ["conference", "meetup", "webinar"];

  events$ = this.query$.pipe(
    switchMap((query) => this.eventService.getAll(query).pipe(
      map((res) => res.data),
      shareReplay(1)
    ))
  );

  constructor() {}

  changeFilter(type: string, value: string) {
    this.query$.next({
      ...this.query$.value,
      [type]: value
    });
  }

  clearFilter(type: string) {
    this.query$.next({
      ...this.query$.value,
      [type]: ""
    });
  }

}
