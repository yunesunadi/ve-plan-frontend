import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);

  constructor() {}

  send() {
    const user_id_list = this.dialog_data.map((item: any) => item.user_id);
    this.eventRegisterService.approve(user_id_list, this.dialog_data[0].event_id).subscribe({
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
