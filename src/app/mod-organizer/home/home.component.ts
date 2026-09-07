import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EventDialogComponent } from '../../components/event-dialog/event-dialog.component';
import { EventService } from '../../services/event.service';
import { EventCacheService } from '../../caches/event-cache.service';
import { UtilService } from '../../services/util.service';
import { ApiError } from '../../models/ApiError';
import { OrganizerSummary, RecentActivityItem } from '../../models/DashboardSummary';

const ORG = '/organizer/dashboard';

interface StatCard {
  label: string;
  icon: string;
  value: (s: OrganizerSummary) => number;
  link: string;
}

const STAT_CARDS: StatCard[] = [
  { label: 'Upcoming events', icon: 'event_upcoming', value: (s) => s.upcoming_events_count, link: `${ORG}/my_events` },
  { label: 'Awaiting approval', icon: 'how_to_reg', value: (s) => s.registrations_awaiting_approval_count, link: `${ORG}/my_events` },
  { label: 'Pending invitations', icon: 'mail_outline', value: (s) => s.pending_invitations_count, link: `${ORG}/my_events` },
];

const ACTIVITY_META: Record<RecentActivityItem['type'], { icon: string; verb: string }> = {
  registration: { icon: 'person_add', verb: 'registered for' },
  invitation_accepted: { icon: 'mark_email_read', verb: 'accepted an invitation to' },
  meeting_started: { icon: 'sensors', verb: 'started a meeting for' },
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.component.scss',
  imports: [
    RouterLink, MatIcon, MatButton, OutletInnerComponent, PageHeaderComponent, EventCardComponent,
    EmptyStateComponent, ErrorStateComponent, SkeletonComponent,
  ],
})
export class HomeComponent {
  private eventService = inject(EventService);
  private dialog = inject(MatDialog);
  private eventCache = inject(EventCacheService);
  protected readonly util = inject(UtilService);

  protected readonly ORG = ORG;
  protected readonly statCards = STAT_CARDS;
  protected readonly activityMeta = ACTIVITY_META;

  protected readonly loading = signal(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly summary = signal<OrganizerSummary | null>(null);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.refresh$.pipe(
      switchMap(() => {
        this.loading.set(true);
        this.error.set(null);
        return this.eventService.getOrganizerSummary().pipe(
          catchError((err: ApiError) => {
            this.error.set(err);
            this.loading.set(false);
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(),
    ).subscribe((res) => {
      if (res) {
        this.summary.set(res.data);
        this.loading.set(false);
      }
    });
  }

  protected readonly isEmpty = (s: OrganizerSummary) =>
    !s.next_event && s.upcoming_events_count === 0 && s.recent_activity.length === 0 && !s.live_meeting;

  retry() {
    this.refresh$.next();
  }

  openCreateEvent() {
    this.dialog.open(EventDialogComponent, {
      data: {},
      disableClose: true,
      width: '500px',
    }).afterClosed().subscribe(() => {
      this.eventCache.reset();
      this.refresh$.next();
    });
  }
}
