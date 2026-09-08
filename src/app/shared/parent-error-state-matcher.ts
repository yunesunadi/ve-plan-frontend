import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class ParentErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const submitted = !!form?.submitted;
    const interacted = !!(control && (control.dirty || control.touched));

    const controlInErrorState = !!(control?.invalid && (interacted || submitted));

    const parent = control?.parent;
    const parentHasOwnErrors = !!parent?.errors;
    const parentInteracted = !!(parent && (parent.dirty || parent.touched));
    const parentInErrorState = parentHasOwnErrors && (parentInteracted || submitted);

    return controlInErrorState || parentInErrorState;
  }
}
