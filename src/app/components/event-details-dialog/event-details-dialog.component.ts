import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventService } from '../../services/event.service';
import { map, shareReplay } from 'rxjs';
import { format } from 'date-fns';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-event-details-dialog',
  templateUrl: './event-details-dialog.component.html',
  styleUrl: './event-details-dialog.component.scss'
})
export class EventDetailsDialogComponent {
  private dialog_data = inject(MAT_DIALOG_DATA);
  private eventService = inject(EventService);
  private dialog = inject(MatDialogRef<this>);
  private route = inject(Router);

  event$ = this.eventService.getOneById(this.dialog_data.id).pipe(
    map(res => res.data),
    shareReplay()
  );

  constructor() {}

  navigate(url: string) {
    this.route.navigateByUrl(url);
    this.dialog.close();
  }

}
