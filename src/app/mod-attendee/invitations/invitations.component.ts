import { Component, inject } from '@angular/core';
import { EventInviteService } from '../../services/event-invite.service';
import { BehaviorSubject, concatMap, map, shareReplay, tap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { Location } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrl: './invitations.component.scss'
})
export class InvitationsComponent {
  private eventInviteService = inject(EventInviteService);
  private commonService = inject(CommonService);
  private accept$ = new BehaviorSubject(false);
  location = inject(Location);

  isLoading = true;

  invitations$ = this.accept$.pipe(
    concatMap(() => this.eventInviteService.getAllByUserId().pipe(
      tap(() => this.isLoading = false),
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
