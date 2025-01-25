import { Component, inject } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, map, shareReplay } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from '../../../components/session-dialog/session-dialog.component';
import { SessionService } from '../../../services/session.service';

@Component({
  standalone: false,
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrl: './event-view.component.scss'
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private sessionService = inject(SessionService);
  private aroute = inject(ActivatedRoute);
  private route = inject(Router);
  private dialog = inject(MatDialog);

  event$ = this.aroute.params.pipe(
    concatMap((params: any) => this.eventService.getOneById(params.id)),
    map((res) => res.data),
    catchError(() => {
      this.route.navigateByUrl("organizer/dashboard/not-found");
      return EMPTY;
    }),
    shareReplay()
  );

  sessions$ = this.aroute.params.pipe(
    concatMap((params: any) => this.sessionService.getAll(params.id)),
    map((res) => res.data),
    shareReplay()
  );

  constructor() {}

  openSessionModal(event_id: string) {
    const dialogRef = this.dialog.open(SessionDialogComponent, {
      data: {
        event_id,
      },
      disableClose: true,
    });
  }
}
