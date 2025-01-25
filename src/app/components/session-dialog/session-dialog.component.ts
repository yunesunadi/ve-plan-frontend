import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { MatDialogRef } from '@angular/material/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { SessionService } from '../../services/session.service';

@Component({
  standalone: false,
  selector: 'app-session-dialog',
  templateUrl: './session-dialog.component.html',
  styleUrl: './session-dialog.component.scss'
})
export class SessionDialogComponent {
  create_form: FormGroup;

  private form_builder = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private commonService = inject(CommonService);
  private dialog_data = inject(DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);

  constructor() {
    this.create_form = this.form_builder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      event: [this.dialog_data.event_id, Validators.required]
    });
  }

    get titleControl() {
      return this.create_form.controls["title"];
    }

    get descriptionControl() {
      return this.create_form.controls["description"];
    }

    get startTimeControl() {
      return this.create_form.controls["start_time"];
    }

    get endTimeControl() {
      return this.create_form.controls["end_time"];
    }
   submit() {
      if (this.create_form.invalid) return;

      this.sessionService.create(this.create_form.value).subscribe({
        next: (res) => {
          this.commonService.openSnackBar(res.message);
          this.dialog.close();
        },
        error: (err) => {
          this.commonService.openSnackBar("Error creating event.");
          this.dialog.close();
        }
      });
    }
}
