import { Component, inject } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, map, shareReplay } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from '../../../components/session-dialog/session-dialog.component';
import { SessionService } from '../../../services/session.service';
import { EventDialogComponent } from '../../../components/event-dialog/event-dialog.component';
import { environment } from '../../../../environments/environment';

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

  event$ = this.fetchEvents();
  sessions$ = this.fetchSessions();

  constructor() {}

  get cover_url() {
    return environment.coverUrl;
  }

  fetchEvents() {
    return this.aroute.params.pipe(
      concatMap((params: any) => this.eventService.getOneById(params.id)),
      map((res) => res.data),
      catchError(() => {
        this.route.navigateByUrl("organizer/dashboard/not-found");
        return EMPTY;
      }),
      shareReplay(1)
    );
  }

  fetchSessions() {
    return this.aroute.params.pipe(
      concatMap((params: any) => this.sessionService.getAll(params.id)),
      map((res) => res.data),
      shareReplay(1)
    );
  }

  openSessionModal(event_id: string) {
    const dialogRef = this.dialog.open(SessionDialogComponent, {
      data: {
        event_id,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
        this.sessions$ = this.fetchSessions();
      }
    });
  }

  editEvent() {
    this.event$.subscribe({
      next: (event) => {
        const dialogRef = this.dialog.open(EventDialogComponent, {
          data: event,
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe({
          next: () => {
            this.event$ = this.fetchEvents();
          }
        });
      }
    })
    
  }
}
