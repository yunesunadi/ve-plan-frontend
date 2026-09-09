import { Component, computed, inject, signal, Signal, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { SessionService } from '../../services/session.service';
import { concatMap, iif, map, of } from 'rxjs';
import { EventService } from '../../services/event.service';
import { ApiError } from '../../models/ApiError';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatTimepickerInput, MatTimepicker, MatTimepickerToggle } from '@angular/material/timepicker';
import { MatButton } from '@angular/material/button';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' && value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

@Component({
    selector: 'app-session-dialog',
    templateUrl: './session-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './session-dialog.component.scss',
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, CdkTextareaAutosize, MatTimepickerInput, MatTimepicker, MatTimepickerToggle, MatSuffix, MatDialogActions, MatButton, MatDialogClose, FormErrorComponent, SubmitButtonComponent]
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

  private event = toSignal(
    this.eventService.getOneById(this.dialog_data.event_id).pipe(map((res) => res.data)),
    { initialValue: null },
  );

  private startValue: Signal<Date | null>;
  private endValue: Signal<Date | null>;

  readonly startMin = computed(() => toDate(this.event()?.start_time));
  readonly startMax = computed(() => this.endValue() ?? toDate(this.event()?.end_time));
  readonly endMin = computed(() => this.startValue() ?? toDate(this.event()?.start_time));
  readonly endMax = computed(() => toDate(this.event()?.end_time));

  constructor() {
    this.create_form = this.form_builder.group({
      title: [this.dialog_data.title || '', Validators.required],
      description: [this.dialog_data.description || ''],
      speaker_info: [this.dialog_data.speaker_info || ''],
      start_time: [toDate(this.dialog_data.start_time), Validators.required],
      end_time: [toDate(this.dialog_data.end_time), Validators.required],
      event: [this.dialog_data.event_id, Validators.required]
    },
    {
      validators: this.checkTimeValidator()
    });

    this.startValue = toSignal(this.startTimeControl.valueChanges.pipe(map(toDate)), {
      initialValue: toDate(this.dialog_data.start_time),
    });
    this.endValue = toSignal(this.endTimeControl.valueChanges.pipe(map(toDate)), {
      initialValue: toDate(this.dialog_data.end_time),
    });
  }

  checkTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = toDate(control.value['start_time']);
      const end = toDate(control.value['end_time']);
      if (!start || !end) return null;

      return end.getTime() <= start.getTime() ? { invalidTime: true } : null;
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
      error: (err: unknown) => {
        this.submitting.set(false);
        const isApiError = err instanceof ApiError;
        this.commonService.error(
          isApiError ? err.message : `Error ${this.dialog_data._id ? 'updating' : 'creating'} session.`,
        );

        if (!isApiError || err.status >= 500) {
          this.dialog.close();
        }
      }
    });
  }
}
