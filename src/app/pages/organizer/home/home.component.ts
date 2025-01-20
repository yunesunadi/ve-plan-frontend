import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from '../../../components/event-dialog/event-dialog.component';
import { EventService } from '../../../services/event.service';
import { concatMap, map } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
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
      this.eventService.getAll().pipe(
        map(res => res.data),
        map(events => events.map((event) => ({
          id: event._id,
          title: event.title,
          start: event.date,
        })))
      ).subscribe({
        next: (events) => successCallback(events),
        error: (err) => failureCallback(err),
      });
    },
    weekends: true,
    dayMaxEvents: true,
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    height: 650,
  });
  
  private dialog = inject(MatDialog);
  private changeDetector = inject(ChangeDetectorRef);
  private eventService = inject(EventService);

  constructor() {}

  handleDateClick(arg: DateClickArg) {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        date: arg.date,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(
      concatMap(() => this.eventService.getAll().pipe(
        map(res => res.data),
        map(events => events.map((event) => ({
          id: event._id,
          title: event.title,
          start: event.date,
        })))
      ))
    ).subscribe({
      next: (events) => {
        this.calendarOptions.update(prev => ({
          ...prev,
          events
        }));
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg) {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  }

  handleEvents() {
    this.changeDetector.detectChanges();
  }
}
