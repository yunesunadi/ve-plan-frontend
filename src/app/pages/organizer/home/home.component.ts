import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from '../../../components/event-dialog/event-dialog.component';
import { EventService } from '../../../services/event.service';
import { concatMap, map } from 'rxjs';
import { EventDetailsDialogComponent } from '../../../components/event-details-dialog/event-details-dialog.component';

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
    const dialogRef = this.dialog.open(EventDetailsDialogComponent, {
      data: {
        id: clickInfo.event.id,
      },
      autoFocus: false
    });

  }

  handleEvents() {
    this.changeDetector.detectChanges();
  }
}
