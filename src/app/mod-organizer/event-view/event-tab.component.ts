import { Component, computed, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../../models/Event';
import { BehaviorSubject, catchError, filter, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { AsyncPipe } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { SessionDialogComponent } from '../../components/session-dialog/session-dialog.component';
import { Session } from '../../models/Session';
import { ApiError } from '../../models/ApiError';
import { EventDetailsCardComponent } from '../../shared/event-details-card/event-details-card.component';
import { SessionDetailsCardComponent } from '../../shared/session-details-card/session-details-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { EventViewStore } from '../../shared/event-view/event-view-store';

type TabId = 'overview' | 'agenda' | 'people';

@Component({
  selector: 'app-organizer-event-tab',
  templateUrl: './event-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './event-tab.component.scss',
  imports: [
    RouterLink, MatButton, MatIconButton, MatIcon, MatMenuTrigger, MatMenu, MatMenuItem, AsyncPipe,
    EventDetailsCardComponent, SessionDetailsCardComponent,
    SkeletonComponent, EmptyStateComponent, ErrorStateComponent,
  ],
})
export class EventTabComponent {
  private sessionService = inject(SessionService);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  protected store = inject(EventViewStore);

  tab = input.required<TabId>();

  private readonly routeEvent = this.route.snapshot.data['event'] as Event;

  protected readonly event = computed(() => this.store.event() ?? this.routeEvent);

  private eventId(): string {
    return this.event()._id;
  }

  protected readonly skeletonPlaceholders = Array.from({ length: 3 });
  protected readonly sessionsLoading = signal(true);
  protected readonly sessionsError = signal<ApiError | null>(null);

  private fetchSessions$ = new BehaviorSubject<void>(undefined);

  protected sessions$ = this.fetchSessions$.pipe(
    tap(() => {
      this.sessionsLoading.set(true);
      this.sessionsError.set(null);
    }),
    switchMap(() => this.sessionService.getAll(this.eventId()).pipe(
      map((res) => {
        this.sessionsLoading.set(false);
        return [...res.data].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
        );
      }),
      catchError((err: unknown) => {
        this.sessionsLoading.set(false);
        this.sessionsError.set(err instanceof ApiError ? err : null);
        return of([] as Session[]);
      }),
    )),
    shareReplay(1),
  );

  protected retrySessions(): void {
    this.fetchSessions$.next();
  }

  protected addSession(): void {
    this.openSessionDialog({ event_id: this.eventId() });
  }

  protected editSession(sessionId: string): void {
    this.sessionService.getOneById(sessionId).pipe(map((res) => res.data)).subscribe({
      next: (session) => this.openSessionDialog({ ...session, event_id: this.eventId() }),
    });
  }

  private openSessionDialog(data: Record<string, unknown>): void {
    this.dialog.open(SessionDialogComponent, { data, disableClose: true, width: '500px' })
      .afterClosed().subscribe(() => this.fetchSessions$.next());
  }

  protected deleteSession(sessionId: string): void {
    this.confirmService.confirm({
      title: 'Delete this session?',
      body: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    }).pipe(
      filter(Boolean),
      switchMap(() => this.sessionService.delete(sessionId)),
    ).subscribe({
      next: (res) => {
        this.commonService.success(res.message);
        this.fetchSessions$.next();
      },
      error: (err) => {
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }
}
