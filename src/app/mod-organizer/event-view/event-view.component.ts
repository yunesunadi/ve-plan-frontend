import { Component, computed, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, filter, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from '../../components/session-dialog/session-dialog.component';
import { SessionService } from '../../services/session.service';
import { EventDialogComponent } from '../../components/event-dialog/event-dialog.component';
import { jwtDecode } from 'jwt-decode';
import { UserPayload } from '../../models/User';
import { Event } from '../../models/Event';
import { AsyncPipe } from '@angular/common';
import { ApiError } from '../../models/ApiError';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { EventDetailsCardComponent } from '../../shared/event-details-card/event-details-card.component';
import { SessionDetailsCardComponent } from '../../shared/session-details-card/session-details-card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
    selector: 'app-event-view',
    templateUrl: './event-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './event-view.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, ErrorStateComponent, EmptyStateComponent, MatButton, MatIcon, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, RouterLink, EventDetailsCardComponent, SessionDetailsCardComponent, AsyncPipe]
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private sessionService = inject(SessionService);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);
  private aroute = inject(ActivatedRoute);
  private route = inject(Router);
  private dialog = inject(MatDialog);
  private fetchSessions$ = new BehaviorSubject(false);

  event = input.required<Event>();

  private eventOverride = signal<Event | null>(null);
  displayEvent = computed(() => this.eventOverride() ?? this.event());

  sessionsError = signal<ApiError | null>(null);

  constructor() {
    effect(() => {
      this.event();
      this.eventOverride.set(null);
    });
  }

  sessions$ = this.fetchSessions$.pipe(
    tap(() => this.sessionsError.set(null)),
    switchMap(() => this.aroute.params),
    switchMap((params: any) => this.sessionService.getAll(params.id)),
    map((res) => res.data),
    catchError((err: ApiError) => {
      this.sessionsError.set(err);
      return of([]);
    }),
    shareReplay(1)
  );

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
        this.eventService.getOneById(event._id).subscribe({
          next: (res) => this.eventOverride.set(res.data),
        });
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

  deleteEvent(event_id: string, event_title: string) {
    this.confirmService.confirm({
      title: "Delete this event?",
      body: "Once you delete this, all data related with this event will be removed. This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
      confirmationPhrase: event_title,
      confirmationHint: "Type the event title to confirm",
    }).pipe(
      filter(Boolean),
      switchMap(() => this.eventService.delete(event_id))
    ).subscribe({
      next: (res) => {
        this.commonService.success(res.message);
        this.route.navigateByUrl("organizer/dashboard/events");
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
      }
    });
  }

  retrySessions() {
    this.fetchSessions$.next(true);
  }

  deleteSession(session_id: string) {
    this.confirmService.confirm({
      title: "Delete this session?",
      body: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    }).pipe(
      filter(Boolean),
      switchMap(() => this.sessionService.delete(session_id))
    ).subscribe({
      next: (res) => {
        this.commonService.success(res.message);
        this.fetchSessions$.next(true);
      }
    });
  }
}
