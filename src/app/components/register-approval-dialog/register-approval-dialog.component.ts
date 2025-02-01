import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { concatMap, EMPTY, mergeMap, of } from 'rxjs';
import { EmailService } from '../../services/email.service';
import { CommonService } from '../../services/common.service';
import { EventRegisterService } from '../../services/event-register.service';

@Component({
  standalone: false,
  selector: 'app-register-approval-dialog',
  templateUrl: './register-approval-dialog.component.html',
  styleUrl: './register-approval-dialog.component.scss'
})
export class RegisterApprovalDialogComponent {
  dialog_data = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);
  private emailService = inject(EmailService);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);

  constructor() {}

  send() {
    of(...this.dialog_data).pipe(
      mergeMap(
        (item: any) => this.emailService.send("register_approved", item.email, item.name, item.event_title).pipe(
          concatMap(() => this.eventRegisterService.approve(item.user_id, item.event_id))
        )
      )
    ).subscribe({
      error: () => {
        this.dialog.close();
        this.commonService.openSnackBar("Failed to send approval.");
      },
      complete: () => {
        this.dialog.close(true);
        this.commonService.openSnackBar("Send approval successfully.");
      }
    });
  }
}
