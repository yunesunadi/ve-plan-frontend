import { Component, inject } from '@angular/core';
import { EventInviteService } from '../../services/event-invite.service';
import { map } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-invited-users-dialog',
  templateUrl: './invited-users-dialog.component.html',
  styleUrl: './invited-users-dialog.component.scss'
})
export class InvitedUsersDialogComponent {
  private dialog_data = inject(MAT_DIALOG_DATA);
  private eventInviteService = inject(EventInviteService);

  invited_users$ = this.eventInviteService.getAll(this.dialog_data.id).pipe(
    map((res) => res.data)
  );

  constructor() {}

}
