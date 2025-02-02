import { Component, inject } from '@angular/core';
import { EventInviteService } from '../../../services/event-invite.service';
import { map } from 'rxjs';
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

  invitations$ = this.eventInviteService.getAllByUserId().pipe(
    map((res) => res.data)
  );

  constructor() {}

  accept(event_id: string) {
    this.eventInviteService.accept_invite(event_id).subscribe({
      next: () => {
        this.commonService.openSnackBar("Accept invitation successfully.");
      }
    });
  }

}
