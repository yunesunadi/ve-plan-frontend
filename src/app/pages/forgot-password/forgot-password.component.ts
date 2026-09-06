import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ApiError } from '../../models/ApiError';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './forgot-password.component.scss',
    imports: [RegisterWrapperComponent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, RouterLink, MatIcon, FormErrorComponent, SubmitButtonComponent]
})
export class ForgotPasswordComponent {

  private authService = inject(AuthService);
  private commonService = inject(CommonService);

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  submitting = signal(false);

  onSubmit() {
    this.forgotPasswordForm.markAllAsTouched();

    if (this.forgotPasswordForm.invalid) return;

    const email = this.forgotPasswordForm.value.email as string;

    this.submitting.set(true);
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.submitting.set(false);
        this.commonService.success("Sent password reset email successfully. Please check your email.");
      },
      error: (err) => {
        this.submitting.set(false);
        const message = err instanceof ApiError && err.message
          ? err.message
          : "Failed to sent password reset email.";
        this.commonService.error(message);
      }
    });
  }
}
