import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventInviteService } from '../../services/event-invite.service';
import { map } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-accepted-users-dialog',
  templateUrl: './accepted-users-dialog.component.html',
  styleUrl: './accepted-users-dialog.component.scss'
})
export class AcceptedUsersDialogComponent {
  private dialog_data = inject(MAT_DIALOG_DATA);
  private eventInviteService = inject(EventInviteService);

  accepted_users$ = this.eventInviteService.getAllAccepted(this.dialog_data.id).pipe(
    map((res) => res.data)
  );

  constructor() {}

}
