import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { EventInviteService } from '../../services/event-invite.service';
import { BehaviorSubject, concatMap, map, scan, shareReplay, tap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { Location, AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Timestamp } from '../../models/Utils';
import { EventInvite } from '../../models/EventInvite';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardActions } from '@angular/material/card';
import { RouterLink } from '@angular/router';

type InviteRow = Timestamp & EventInvite;

@Component({
    selector: 'app-invitations',
    templateUrl: './invitations.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invitations.component.scss',
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatIcon, MatCard, MatCardTitle, MatCardSubtitle, RouterLink, MatCardActions, AsyncPipe]
})
export class InvitationsComponent {
  private eventInviteService = inject(EventInviteService);
  private commonService = inject(CommonService);
  location = inject(Location);

  readonly LOAD_LIMIT = 20;

  isLoading = signal(true);
  total = signal(0);

  private offset$ = new BehaviorSubject<number>(0);

  invitations$ = this.offset$.pipe(
    concatMap((offset) => this.eventInviteService.getAllByUserId({ offset, limit: this.LOAD_LIMIT }).pipe(
      tap((res) => {
        this.isLoading.set(false);
        this.total.set(res.meta?.total ?? 0);
      }),
      map((res) => ({ data: res.data, offset }))
    )),
    scan((acc: InviteRow[], { data, offset }) => (offset === 0 ? [...data] : [...acc, ...data]), []),
    shareReplay(1)
  );

  constructor() {}

  loadMore(currentLength: number) {
    this.offset$.next(currentLength);
  }

  accept(event_id: string) {
    this.eventInviteService.accept_invite(event_id).subscribe({
      next: () => {
        this.commonService.openSnackBar("Accept invitation successfully.");
        this.offset$.next(0);
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
        this.offset$.next(0);
      }
    });
  }

}
