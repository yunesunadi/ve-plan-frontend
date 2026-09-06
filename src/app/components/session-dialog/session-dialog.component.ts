import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { SessionService } from '../../services/session.service';
import { concatMap, iif, map, of, shareReplay } from 'rxjs';
import { EventService } from '../../services/event.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatTimepickerInput, MatTimepicker, MatTimepickerToggle } from '@angular/material/timepicker';
import { MatButton } from '@angular/material/button';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

@Component({
    selector: 'app-session-dialog',
    templateUrl: './session-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './session-dialog.component.scss',
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, CdkTextareaAutosize, MatTimepickerInput, MatTimepicker, MatTimepickerToggle, MatSuffix, MatDialogActions, MatButton, MatDialogClose, AsyncPipe, DatePipe, FormErrorComponent, SubmitButtonComponent]
})
export class SessionDialogComponent {
  create_form: FormGroup;
  submitting = signal(false);

  private form_builder = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private eventService = inject(EventService);
  private commonService = inject(CommonService);
  dialog_data = inject(DIALOG_DATA);
  private dialog = inject(MatDialogRef<this>);

  event$ = this.eventService.getOneById(this.dialog_data.event_id).pipe(
    map(res => res.data),
    shareReplay(1)
  );

  constructor() {
    this.create_form = this.form_builder.group({
      title: [this.dialog_data.title || '', Validators.required],
      description: [this.dialog_data.description || ''],
      speaker_info: [this.dialog_data.speaker_info || ''],
      start_time: [this.dialog_data.start_time || '', Validators.required],
      end_time: [this.dialog_data.end_time || '', Validators.required],
      event: [this.dialog_data.event_id, Validators.required]
    },
    {
      validators: this.checkTimeValidator()
    });
  }

  checkTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start_time = new Date(control.value['start_time']).getTime();
      const end_time = new Date(control.value['end_time']).getTime();

      if (start_time > end_time) return { invalidTime: true };

      return null;
    };
  }

  get titleControl() {
    return this.create_form.controls["title"];
  }

  get descriptionControl() {
    return this.create_form.controls["description"];
  }

  get speakerInfoControl() {
    return this.create_form.controls["speaker_info"];
  }

  get startTimeControl() {
    return this.create_form.controls["start_time"];
  }

  get endTimeControl() {
    return this.create_form.controls["end_time"];
  }

  submit() {
    this.create_form.markAllAsTouched();

    if (this.create_form.invalid) return;

    this.submitting.set(true);

    of(true).pipe(
      concatMap(() => iif(
        () => !!this.dialog_data._id,
        this.sessionService.update(this.dialog_data._id, this.create_form.value),
        this.sessionService.create(this.create_form.value)
      ))
    ).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.commonService.success(res.message);
        this.dialog.close();
      },
      error: (_err) => {
        this.submitting.set(false);
        this.commonService.error("Error creating event.");
        this.dialog.close();
      }
    });
  }
}
