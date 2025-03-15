import { Component, inject } from '@angular/core';
import { EventInviteService } from '../../../services/event-invite.service';
import { BehaviorSubject, concatMap, map, shareReplay } from 'rxjs';
import { CommonService } from '../../../services/common.service';

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

  invitations$ = this.accept$.pipe(
    concatMap(() => this.eventInviteService.getAllByUserId()),
    map((res) => res.data),
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
