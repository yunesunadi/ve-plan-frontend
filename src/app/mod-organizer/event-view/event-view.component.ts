import { Component, inject, signal } from '@angular/core';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, EMPTY, map, shareReplay, switchMap, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from '../../components/session-dialog/session-dialog.component';
import { SessionService } from '../../services/session.service';
import { EventDialogComponent } from '../../components/event-dialog/event-dialog.component';
import { jwtDecode } from 'jwt-decode';
import { UserPayload } from '../../models/User';
import { Event } from '../../models/Event';
import { Location } from '@angular/common';
import { CommonService } from '../../services/common.service';

@Component({
  standalone: false,
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrl: './event-view.component.scss'
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private sessionService = inject(SessionService);
  private commonService = inject(CommonService);
  private aroute = inject(ActivatedRoute);
  private route = inject(Router);
  private dialog = inject(MatDialog);
  private fetchEvents$ = new BehaviorSubject(false);
  private fetchSessions$ = new BehaviorSubject(false);
  location = inject(Location);

  isLoading = signal(true);

  event$ = this.fetchEvents$.pipe(
    switchMap(() => this.aroute.params),
    switchMap((params: any) => this.eventService.getOneById(params.id)),
    map((res) => res.data),
    tap(() => this.isLoading.set(false)),
    catchError(() => {
      this.isLoading.set(false);
      this.route.navigateByUrl("organizer/dashboard/not-found");
      return EMPTY;
    }),
    shareReplay(1)
  );

  sessions$ = this.fetchSessions$.pipe(
    switchMap(() => this.aroute.params),
    switchMap((params: any) => this.sessionService.getAll(params.id)),
    map((res) => res.data),
    shareReplay(1)
  );

  constructor() {}

  openSessionModal(event_id: string) {
    const dialogRef = this.dialog.open(SessionDialogComponent, {
      data: {
        event_id,
      },
      disableClose: true,
      width: "500px"
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
        this.fetchSessions$.next(true);
      }
    });
  }

  editEvent(event: Event) {
    const event_data = {
      ...event,
      start_time: new Date(event.start_time).toISOString(),
      end_time: new Date(event.end_time).toISOString(),
    }

    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: event_data,
      disableClose: true,
      width: "500px"
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
        this.fetchEvents$.next(true);
      }
    });
  }

  editSession(session_id: string, event_id: string) {
    this.sessionService.getOneById(session_id).pipe(
      map((res) => res.data),
    ).subscribe({
      next: (session) => {
        const dialogRef = this.dialog.open(SessionDialogComponent, {
          data: {
            ...session,
            event_id
          },
          disableClose: true,
          width: "500px"
        });

        dialogRef.afterClosed().subscribe({
          next: () => {
            this.fetchSessions$.next(true);
          }
        });
      }
    });
  }

  isOwner(user_id: string) {
    const token = localStorage.getItem("token") || "";
    const user_payload: UserPayload = jwtDecode(token);
    return user_payload._id === user_id;
  }

  deleteEvent(event_id: string) {
    const isConfirmed = confirm("Are you sure to delete this event? Once you delete this, all data related with this event will be removed. This action cannot be undone.");

    if (isConfirmed) {
      this.eventService.delete(event_id).subscribe({
        next: (res) => {
          this.commonService.openSnackBar(res.message);
          this.route.navigateByUrl("organizer/dashboard/events");
        }
      });
    }
  }

  deleteSession(session_id: string) {
    const isConfirmed = confirm("Are you sure to delete this event session? This action cannot be undone.");

    if (isConfirmed) {
      this.sessionService.delete(session_id).subscribe({
        next: (res) => {
          this.commonService.openSnackBar(res.message);
          this.fetchSessions$.next(true);
        }
      });
    }
  }
}
