import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CommonService } from '../../services/common.service';
import { EventInviteService } from '../../services/event-invite.service';
import { ApiError } from '../../models/ApiError';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

interface RowResult {
  name: string;
  outcome: 'invited' | 'skipped';
}

@Component({
  selector: 'app-invitation-sent-dialog',
  templateUrl: './invitation-sent-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './invitation-sent-dialog.component.scss',
  imports: [CdkScrollable, MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatIcon, MatDialogClose, EmptyStateComponent],
})
export class InvitationSentDialogComponent {
  dialog_data = inject<Array<{ user_id: string; name: string; event_id: string }>>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private eventInviteService = inject(EventInviteService);

  protected readonly sending = signal(false);
  protected readonly results = signal<RowResult[] | null>(null);
  protected readonly queued = signal(0);

  send(): void {
    this.sending.set(true);
    const userIds = this.dialog_data.map((item) => item.user_id);

    this.eventInviteService.invite(userIds, this.dialog_data[0].event_id).subscribe({
      next: (res) => {
        this.sending.set(false);
        const invited = new Set((res.data?.invited ?? []).map((u: { _id: string }) => u._id));
        this.results.set(this.dialog_data.map((row) => ({
          name: row.name,
          outcome: invited.has(row.user_id) ? 'invited' : 'skipped',
        })));
        this.queued.set(res.data?.email?.queued ?? 0);
      },
      error: (err: unknown) => {
        this.sending.set(false);
        this.dialog.close();
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }

  done(): void {
    this.dialog.close(true);
  }
}
