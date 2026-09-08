import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BehaviorSubject, Subject, combineLatest, concatMap, distinctUntilChanged,
  catchError, map, of, scan, shareReplay, startWith, switchMap, tap,
} from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { EventService } from '../../services/event.service';
import { EventInviteService } from '../../services/event-invite.service';
import { CommonService } from '../../services/common.service';
import { ApiError } from '../../models/ApiError';
import { Event, MyEventsFilter, ParticipationState } from '../../models/Event';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { StatusKind } from '../../shared/ui/status-chip/status-chip.component';

interface FilterTab {
  value: MyEventsFilter;
  label: string;
  empty: { headline: string; supporting: string };
}

const FILTER_TABS: FilterTab[] = [
  {
    value: 'all', label: 'All',
    empty: {
      headline: "You haven't joined any events",
      supporting: 'Events you are invited to or register for will show up here.',
    },
  },
  {
    value: 'invited', label: 'Invited',
    empty: {
      headline: 'No invitations',
      supporting: 'When an organizer invites you to an event, it appears here.',
    },
  },
  {
    value: 'registered', label: 'Registered',
    empty: {
      headline: 'No pending registrations',
      supporting: 'Events you have registered for and are awaiting approval on appear here.',
    },
  },
  {
    value: 'approved', label: 'Approved',
    empty: {
      headline: 'No approved registrations',
      supporting: 'Once an organizer approves your registration, that event appears here.',
    },
  },
  {
    value: 'attending', label: 'Attending',
    empty: {
      headline: 'Not attending any events yet',
      supporting: 'Accept an invitation and the event shows up here.',
    },
  },
];

const PARTICIPATION_STATUS: Record<Exclude<ParticipationState, 'none'>, StatusKind> = {
  registered: 'registered',
  registration_approved: 'register_approved',
  invited: 'invited',
  invitation_accepted: 'invitation_accepted',
};

const LOAD_LIMIT = 12;

@Component({
  selector: 'app-attendee-my-events',
  templateUrl: './my-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './my-events.component.scss',
  imports: [
    OutletInnerComponent, PageHeaderComponent, MatButton, MatMenu, MatMenuItem, MatMenuTrigger, MatIcon,
    RouterLink, AsyncPipe, EventCardComponent, SkeletonComponent, EmptyStateComponent, ErrorStateComponent,
  ],
})
export class MyEventsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private inviteService = inject(EventInviteService);
  private commonService = inject(CommonService);

  readonly LOAD_LIMIT = LOAD_LIMIT;
  readonly tabs = FILTER_TABS;
  readonly skeletonPlaceholders = Array.from({ length: 6 });

  isLoading = signal(true);
  isLoadingMore = signal(false);
  error = signal<ApiError | null>(null);
  loadMoreError = signal<ApiError | null>(null);
  total = signal(0);
  accepting = signal<string | null>(null);
  currentFilter = signal<MyEventsFilter>('all');

  readonly currentTab = computed(
    () => this.tabs.find((tab) => tab.value === this.currentFilter()) ?? this.tabs[0],
  );

  private reload$ = new BehaviorSubject<void>(undefined);
  private more$ = new Subject<number>();

  events$ = combineLatest([
    this.route.queryParams.pipe(
      map((params) => this.normalizeFilter(params['filter'])),
      distinctUntilChanged(),
    ),
    this.reload$,
  ]).pipe(
    map(([filter]) => filter),
    tap((filter) => {
      if (filter !== this.currentFilter()) {
        this.isLoading.set(true);
      }
      this.currentFilter.set(filter);
      this.error.set(null);
      this.loadMoreError.set(null);
    }),
    switchMap((filter) => this.more$.pipe(
      startWith(0),
      tap((offset) => {
        if (offset) {
          this.isLoadingMore.set(true);
          this.loadMoreError.set(null);
        }
      }),
      concatMap((offset) => this.eventService.getAttendeeEvents({ filter, offset, limit: LOAD_LIMIT }).pipe(
        tap((res) => {
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
          this.total.set(res.meta?.total ?? 0);
          this.error.set(null);
          this.loadMoreError.set(null);
        }),
        map((res) => ({ data: res.data as Event[], offset })),
        catchError((err: unknown) => {
          const apiErr = err instanceof ApiError ? err : null;
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
          if (offset) {
            this.loadMoreError.set(apiErr);
          } else {
            this.error.set(apiErr);
          }
          return of({ data: [] as Event[], offset });
        }),
      )),
      scan((acc: Event[], { data, offset }) => (offset === 0 ? data : [...acc, ...data]), [] as Event[]),
    )),
    takeUntilDestroyed(),
    shareReplay(1),
  );

  private normalizeFilter(raw: unknown): MyEventsFilter {
    return this.tabs.some((tab) => tab.value === raw) ? (raw as MyEventsFilter) : 'all';
  }

  statusFor(event: Event): StatusKind | null {
    const state = event.participation_state;
    return state && state !== 'none' ? PARTICIPATION_STATUS[state] : null;
  }

  isInvited(event: Event): boolean {
    return event.participation_state === 'invited';
  }

  changeFilter(filter: MyEventsFilter): void {
    if (filter === this.currentFilter()) return;
    this.isLoading.set(true);
    this.router.navigate(['/attendee/dashboard/my_events'], {
      queryParams: { filter },
      replaceUrl: true,
    });
  }

  loadMore(currentLength: number): void {
    this.more$.next(currentLength);
  }

  retry(): void {
    this.isLoading.set(true);
    this.reload$.next();
  }

  accept(eventId: string): void {
    this.accepting.set(eventId);
    this.inviteService.accept_invite(eventId).subscribe({
      next: () => {
        this.commonService.success('Invitation accepted.');
        this.accepting.set(null);
        this.reload$.next();
      },
      error: (err: unknown) => {
        if (err instanceof ApiError) this.commonService.error(err);
        this.accepting.set(null);
      },
    });
  }
}
