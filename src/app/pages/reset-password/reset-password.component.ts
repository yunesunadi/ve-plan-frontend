import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ApiError } from '../../models/ApiError';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './reset-password.component.scss',
    imports: [RegisterWrapperComponent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton, RouterLink, MatIcon, FormErrorComponent, SubmitButtonComponent]
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);
  private commonService = inject(CommonService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  resetPasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  expired = signal(false);
  expiredMessage = signal('This password reset link has expired. Request a new one.');
  submitting = signal(false);

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
