import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CommonService } from '../../services/common.service';
import { EventRegisterService } from '../../services/event-register.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

interface RowResult {
  name: string;
  outcome: 'approved' | 'skipped';
}

@Component({
  selector: 'app-register-approval-dialog',
  templateUrl: './register-approval-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './register-approval-dialog.component.scss',
  imports: [CdkScrollable, MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatIcon, MatDialogClose, EmptyStateComponent],
})
export class RegisterApprovalDialogComponent {
  dialog_data = inject<Array<{ user_id: string; name: string; event_id: string }>>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);

  protected readonly sending = signal(false);
  protected readonly results = signal<RowResult[] | null>(null);
  protected readonly queued = signal(0);

  send(): void {
    this.sending.set(true);
    const userIds = this.dialog_data.map((item) => item.user_id);

    this.eventRegisterService.approve(userIds, this.dialog_data[0].event_id).subscribe({
      next: (res) => {
        this.sending.set(false);
        const approved = new Set((res.data?.approved ?? []).map((u: { _id: string }) => u._id));
        this.results.set(this.dialog_data.map((row) => ({
          name: row.name,
          outcome: approved.has(row.user_id) ? 'approved' : 'skipped',
        })));
        this.queued.set(res.data?.email?.queued ?? 0);
      },
      error: () => {
        this.sending.set(false);
        this.dialog.close();
        this.commonService.error('Failed to send approval.');
      },
    });
  }

  done(): void {
    this.dialog.close(true);
  }
}
