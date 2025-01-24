import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventService } from '../../services/event.service';
import { map, shareReplay } from 'rxjs';
import { format } from 'date-fns';

@Component({
  standalone: false,
  selector: 'app-event-details-dialog',
  templateUrl: './event-details-dialog.component.html',
  styleUrl: './event-details-dialog.component.scss'
})
export class EventDetailsDialogComponent {
  private dialog_data = inject(MAT_DIALOG_DATA);
  private eventService = inject(EventService);

  event$ = this.eventService.getOneById(this.dialog_data.id).pipe(
    map(res => res.data),
    shareReplay()
  );

  constructor() {}

  formatDate(value: string) {
    return format(value, "dd/MM/yyyy");
  }

  formatTime(value: string) {
    return format(value, "hh:mm a");
  }

}
