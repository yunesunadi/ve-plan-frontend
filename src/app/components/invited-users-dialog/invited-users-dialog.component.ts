import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { EventInviteService } from '../../services/event-invite.service';
import { map, shareReplay } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-invited-users-dialog',
    templateUrl: './invited-users-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invited-users-dialog.component.scss',
    imports: [CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, AsyncPipe]
})
export class InvitedUsersDialogComponent {
  private dialog_data = inject(MAT_DIALOG_DATA);
  private eventInviteService = inject(EventInviteService);

  invited_users$ = this.eventInviteService.getAllByEventId(this.dialog_data.id).pipe(
    map((res) => res.data),
    shareReplay(1)
  );

  constructor() {}

}
