import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);
  private commonService = inject(CommonService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  resetPasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

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
          catchError(() => {
            this.commonService.openSnackBar("Failed to reset password.");
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
