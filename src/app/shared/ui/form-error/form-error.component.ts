import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { of, switchMap } from 'rxjs';

import { VALIDATION_MESSAGES } from '../../validation-messages';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'mat-error[appFormError]',
  templateUrl: './form-error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './form-error.component.scss',
  imports: [],
})
export class FormErrorComponent {
  control = input.required<AbstractControl | null>();
  labelFor = input<string>('This field');

  private readonly controlEvent = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) => (control ? control.events : of(null))),
    ),
    { initialValue: null },
  );

  protected readonly message = computed<string | null>(() => {
    this.controlEvent();

    const control = this.control();
    if (!control || !control.touched || !control.errors) return null;

    const key = Object.keys(control.errors)[0];
    if (!key) return null;

    const resolve = VALIDATION_MESSAGES[key];
    return resolve
      ? resolve(this.labelFor(), control.errors[key])
      : `${this.labelFor()} is invalid.`;
  });
}
