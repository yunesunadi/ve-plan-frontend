import { Component, computed, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { Event } from '../../models/Event';
import { Session } from '../../models/Session';
import { ApiError } from '../../models/ApiError';
import { EventDetailsCardComponent } from '../../shared/event-details-card/event-details-card.component';
import { SessionDetailsCardComponent } from '../../shared/session-details-card/session-details-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { EventViewStore } from '../../shared/event-view/event-view-store';

type TabId = 'overview' | 'agenda';

@Component({
  selector: 'app-attendee-event-tab',
  templateUrl: './event-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './event-tab.component.scss',
  imports: [
    AsyncPipe, EventDetailsCardComponent, SessionDetailsCardComponent,
    SkeletonComponent, EmptyStateComponent, ErrorStateComponent,
  ],
})
export class EventTabComponent {
  private sessionService = inject(SessionService);
  private route = inject(ActivatedRoute);
  protected store = inject(EventViewStore);

  tab = input.required<TabId>();

  private readonly routeEvent = this.route.snapshot.data['event'] as Event;

  private readonly eventId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly event = computed(() => this.store.event() ?? this.routeEvent);
  protected readonly skeletonPlaceholders = Array.from({ length: 3 });
  protected readonly sessionsLoading = signal(true);
  protected readonly sessionsError = signal<ApiError | null>(null);

  private fetchSessions$ = new BehaviorSubject<void>(undefined);

  protected sessions$ = this.fetchSessions$.pipe(
    tap(() => {
      this.sessionsLoading.set(true);
      this.sessionsError.set(null);
    }),
    switchMap(() => this.sessionService.getAll(this.eventId).pipe(
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
}
