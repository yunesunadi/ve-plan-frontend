import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './forgot-password.component.scss',
    imports: [RegisterWrapperComponent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton, RouterLink, MatIcon]
})
export class ForgotPasswordComponent {

  private authService = inject(AuthService);
  private commonService = inject(CommonService);

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  onSubmit() {
    this.forgotPasswordForm.markAllAsTouched();

    if (this.forgotPasswordForm.invalid) return;

    const email = this.forgotPasswordForm.value.email as string;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.commonService.openSnackBar("Sent password reset email successfully. Please check your email.");
      },
      error: (err) => {
        const message = err instanceof HttpErrorResponse && err.error?.message
          ? err.error.message
          : "Failed to sent password reset email.";
        this.commonService.openSnackBar(message);
      }
    });
  }
}
