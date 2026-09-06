import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CommonService } from '../../services/common.service';
import { EventRegisterService } from '../../services/event-register.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
    selector: 'app-register-approval-dialog',
    templateUrl: './register-approval-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './register-approval-dialog.component.scss',
    imports: [CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, EmptyStateComponent]
})
export class RegisterApprovalDialogComponent {
  dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);

  constructor() {}

  send() {
    const user_id_list = this.dialog_data.map((item: any) => item.user_id);
    this.eventRegisterService.approve(user_id_list, this.dialog_data[0].event_id).subscribe({
      next: (res) => {
        this.dialog.close(true);
        const approved = res.data?.approved?.length ?? 0;
        const skipped = res.data?.skipped?.length ?? 0;
        const queued = res.data?.email?.queued ?? 0;

        let message: string;
        if (approved === 0 && skipped > 0) {
          message = "All selected users were already approved.";
        } else if (skipped > 0) {
          message = `Approved ${approved}. Skipped ${skipped} already approved.`;
        } else {
          message = "Send approval successfully.";
        }

        if (queued > 0) {
          message += ` ${queued} email(s) queued.`;
        }

        this.commonService.success(message);
      },
      error: () => {
        this.dialog.close();
        this.commonService.error("Failed to send approval.");
      }
    });
  }
}
