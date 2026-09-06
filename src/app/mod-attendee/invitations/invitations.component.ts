import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { EventInviteService } from '../../services/event-invite.service';
import { BehaviorSubject, catchError, concatMap, map, of, scan, shareReplay, tap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { AsyncPipe } from '@angular/common';
import { ApiError } from '../../models/ApiError';
import { Timestamp } from '../../models/Utils';
import { EventInvite } from '../../models/EventInvite';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';

type InviteRow = Timestamp & EventInvite;

@Component({
    selector: 'app-invitations',
    templateUrl: './invitations.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './invitations.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, MatButton, AsyncPipe, EventCardComponent, SkeletonComponent, EmptyStateComponent, ErrorStateComponent]
})
export class InvitationsComponent {
  private eventInviteService = inject(EventInviteService);
  private commonService = inject(CommonService);

  readonly LOAD_LIMIT = 20;
  readonly skeletonPlaceholders = Array.from({ length: this.LOAD_LIMIT });

  isLoading = signal(true);
  total = signal(0);
  error = signal<ApiError | null>(null);

  private offset$ = new BehaviorSubject<number>(0);

  invitations$ = this.offset$.pipe(
    concatMap((offset) => this.eventInviteService.getAllByUserId({ offset, limit: this.LOAD_LIMIT }).pipe(
      tap((res) => {
        this.isLoading.set(false);
        this.total.set(res.meta?.total ?? 0);
        this.error.set(null);
      }),
      map((res) => ({ data: res.data, offset })),
      catchError((err: unknown) => {
        this.isLoading.set(false);
        if (err instanceof ApiError) this.error.set(err);
        return of({ data: [] as InviteRow[], offset });
      })
    )),
    scan((acc: InviteRow[], { data, offset }) => (offset === 0 ? [...data] : [...acc, ...data]), []),
    shareReplay(1)
  );

  constructor() {}

  loadMore(currentLength: number) {
    this.offset$.next(currentLength);
  }

  retry() {
    this.error.set(null);
    this.isLoading.set(true);
    this.offset$.next(this.offset$.value);
  }

  accept(event_id: string) {
    this.eventInviteService.accept_invite(event_id).subscribe({
      next: () => {
        this.commonService.success("Accept invitation successfully.");
        this.offset$.next(0);
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
        this.offset$.next(0);
      }
    });
  }

}
