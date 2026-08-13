import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventInviteService } from '../../services/event-invite.service';
import { map, shareReplay } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-accepted-users-dialog',
  templateUrl: './accepted-users-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './accepted-users-dialog.component.scss'
})
export class AcceptedUsersDialogComponent {
  private dialog_data = inject(MAT_DIALOG_DATA);
  private eventInviteService = inject(EventInviteService);

  accepted_users$ = this.eventInviteService.getAllAcceptedByEventId(this.dialog_data.id).pipe(
    map((res) => res.data),
    shareReplay(1)
  );

  constructor() {}

}
