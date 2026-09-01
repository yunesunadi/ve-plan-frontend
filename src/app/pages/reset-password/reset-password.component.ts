import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './reset-password.component.scss',
    imports: [RegisterWrapperComponent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton, RouterLink, MatIcon]
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

  onSubmit() {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.invalid) return;

    const password = this.resetPasswordForm.value.password as string;

    this.activatedRoute.queryParams.pipe(
      switchMap((params: any) => {
        const token = params.token;

        if (!token) {
          this.commonService.openSnackBar("Reset password token is required.");
          return EMPTY;
        }

        return this.authService.resetPassword(token, password).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 410) {
              this.expired.set(true);
              this.expiredMessage.set(err.error?.message || this.expiredMessage());
            } else {
              this.commonService.openSnackBar(err.error?.message || "Failed to reset password.");
            }
            return EMPTY;
          })
        );
      })
    ).subscribe({
      next: () => {
        this.commonService.openSnackBar("Reset password successfully.");
        this.router.navigateByUrl('/login');
      }
    });
  }

}
