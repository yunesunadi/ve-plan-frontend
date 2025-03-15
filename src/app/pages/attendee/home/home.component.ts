import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { map, shareReplay } from 'rxjs';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core/index.js';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MatDialog } from '@angular/material/dialog';
import { EventDetailsDialogComponent } from '../../../components/event-details-dialog/event-details-dialog.component';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private eventService = inject(EventService);

  private events$ = this.eventService.getAll().pipe(
    map(res => res.data),
    map(events => events.map((event) => ({
      id: event._id,
      title: event.title,
      start: event.date,
    }))),
    shareReplay(1)
  );

  calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
    ],
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today'
    },
    initialView: 'dayGridMonth',
    initialEvents: (fetchInfo, successCallback, failureCallback) => {
      this.events$.subscribe({
        next: (events) => successCallback(events),
        error: (err) => failureCallback(err),
      });
    },
    weekends: true,
    dayMaxEvents: true,
    eventClick: this.handleEventClick.bind(this),
    height: 650,
  });
  
  private dialog = inject(MatDialog);
  private changeDetector = inject(ChangeDetectorRef);

  constructor() {}

  handleEventClick(clickInfo: EventClickArg) {
    this.dialog.open(EventDetailsDialogComponent, {
      data: {
        id: clickInfo.event.id,
      },
      autoFocus: false,
      width: "500px"
    });
  }

  handleEvents() {
    this.changeDetector.detectChanges();
  }
}
