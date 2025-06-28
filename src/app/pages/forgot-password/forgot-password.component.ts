import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';

@Component({
  standalone: false,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
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
      error: () => {
        this.commonService.openSnackBar("Failed to sent password reset email.");
      }
    });
  }
}
