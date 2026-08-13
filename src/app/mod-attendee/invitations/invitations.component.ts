import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { EventInviteService } from '../../services/event-invite.service';
import { BehaviorSubject, concatMap, map, shareReplay, tap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { Location, AsyncPipe } from '@angular/common';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardActions } from '@angular/material/card';
import { RouterLink } from '@angular/router';

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
  private accept$ = new BehaviorSubject(false);
  location = inject(Location);

  isLoading = signal(true);

  invitations$ = this.accept$.pipe(
    concatMap(() => this.eventInviteService.getAllByUserId().pipe(
      tap(() => this.isLoading.set(false)),
      map((res) => res.data)
    )),
    shareReplay(1)
  );

  constructor() {}

  accept(event_id: string) {
    this.eventInviteService.accept_invite(event_id).subscribe({
      next: () => {
        this.commonService.openSnackBar("Accept invitation successfully.");
        this.accept$.next(true);
      }
    });
  }

}
