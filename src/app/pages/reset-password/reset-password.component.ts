import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiError } from '../../models/ApiError';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';
import { PasswordStrengthComponent } from '../../shared/ui/password-strength/password-strength.component';
import { ParentErrorStateMatcher } from '../../shared/parent-error-state-matcher';

const MIN_LENGTH = 8;

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './reset-password.component.scss',
    imports: [RegisterWrapperComponent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatSuffix, MatButton, MatIconButton, RouterLink, MatIcon, FormErrorComponent, SubmitButtonComponent, PasswordStrengthComponent]
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);
  private commonService = inject(CommonService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  resetPasswordForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required, Validators.minLength(MIN_LENGTH)]),
      confirm_password: new FormControl('', [Validators.required]),
    },
    { validators: this.checkPasswordsValidator() },
  );

  isPassword = signal(true);
  isConfirmPassword = signal(true);
  passwordValue = signal('');
  confirmPasswordMatcher = new ParentErrorStateMatcher();

  expired = signal(false);
  expiredMessage = signal('This password reset link has expired. Request a new one.');
  submitting = signal(false);

  constructor() {
    this.passwordControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.passwordValue.set(value ?? ''));
  }

  checkPasswordsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isNotMatched = control.value['password'] !== control.value['confirm_password'];
      return isNotMatched ? { passwordMismatch: true } : null;
    };
  }

  get passwordControl() {
    return this.resetPasswordForm.controls['password'];
  }

  get confirmPasswordControl() {
    return this.resetPasswordForm.controls['confirm_password'];
  }

  togglePasswordVisibility() {
    this.isPassword.update((prev) => !prev);
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPassword.update((prev) => !prev);
  }

  onSubmit() {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.invalid) return;

    const password = this.resetPasswordForm.value.password as string;

    this.submitting.set(true);

    this.activatedRoute.queryParams.pipe(
      switchMap((params: any) => {
        const token = params.token;

        if (!token) {
          this.submitting.set(false);
          this.commonService.warning("Reset password token is required.");
          return EMPTY;
        }

        return this.authService.resetPassword(token, password).pipe(
          catchError((err: ApiError) => {
            this.submitting.set(false);
            if (err.status === 410) {
              this.expired.set(true);
              this.expiredMessage.set(err.message || this.expiredMessage());
            } else {
              this.commonService.error(err);
            }
            return EMPTY;
          })
        );
      })
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.commonService.success("Reset password successfully.");
        this.router.navigateByUrl('/login');
      }
    });
  }

}
