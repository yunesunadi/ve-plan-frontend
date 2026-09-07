import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EventService } from '../../services/event.service';
import { EventInviteService } from '../../services/event-invite.service';
import { CommonService } from '../../services/common.service';
import { ApiError } from '../../models/ApiError';
import { AttendeeSummary } from '../../models/DashboardSummary';

const ATT = '/attendee/dashboard';

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
  private inviteService = inject(EventInviteService);
  private common = inject(CommonService);

  protected readonly ATT = ATT;
  protected readonly skeletonCards = Array.from({ length: 3 });

  protected readonly loading = signal(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly summary = signal<AttendeeSummary | null>(null);
  protected readonly acceptingId = signal<string | null>(null);

  protected readonly isEmpty = computed(() => {
    const s = this.summary();
    return !!s
      && s.happening_now.length === 0
      && s.starting_soon.length === 0
      && s.pending_invitations.length === 0
      && s.recommended.length === 0;
  });

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.refresh$.pipe(
      switchMap(() => {
        this.loading.set(true);
        this.error.set(null);
        return this.eventService.getAttendeeSummary().pipe(
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

  retry() {
    this.refresh$.next();
  }

  accept(eventId: string) {
    if (this.acceptingId()) return;
    this.acceptingId.set(eventId);

    this.inviteService.accept_invite(eventId).subscribe({
      next: () => {
        this.common.success('Invitation accepted.');
        this.acceptingId.set(null);
        this.refresh$.next();
      },
      error: (err) => {
        this.acceptingId.set(null);
        this.common.error(err instanceof ApiError ? err : 'Could not accept the invitation.');
      },
    });
  }
}
