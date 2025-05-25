import { Component, inject } from '@angular/core';
import { EventService } from '../../services/event.service';
import { map, shareReplay } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {
  private eventService = inject(EventService);

  events$ = this.eventService.getAll().pipe(
    map((res) => res.data),
    shareReplay(1)
  );

  constructor() {}

}
