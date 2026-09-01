import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { catchError, EMPTY, map, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

const GENERIC_FAILURE = 'Verification failed. The link may be invalid or expired.';
const RESEND_COOLDOWN_MS = 30_000;

type VerifyStatus = 'pending' | 'verifying' | 'failed' | 'expired';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./verify-email.component.scss'],
    imports: [
        RegisterWrapperComponent,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatButton,
        MatIcon,
        RouterLink,
    ]
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private commonService = inject(CommonService);
  private router = inject(Router);

  status = signal<VerifyStatus>('pending');
  errorMessage = signal(GENERIC_FAILURE);
  pendingEmail = signal<string | null>(null);
  resending = signal(false);
  resendCooldown = signal(false);
  resent = signal(false);

  private cooldownTimer: ReturnType<typeof setTimeout> | undefined;

  resendForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(
      switchMap((params: any) => {
        const token = params.token;

        if (!token) {
          this.pendingEmail.set(params.email || null);
          this.status.set('pending');
          return EMPTY;
        }

        this.status.set('verifying');
        return this.authService.verifyEmail(token).pipe(
          map((res) => res.token),
          catchError((err: HttpErrorResponse) => {
            this.status.set(err.status === 410 ? 'expired' : 'failed');
            this.errorMessage.set(err.error?.message || GENERIC_FAILURE);
            return EMPTY;
          })
        );
      })
    ).subscribe({
      next: (token) => {
        localStorage.setItem('token', token);
        this.commonService.openSnackBar('Your email has been verified!');
        this.router.navigateByUrl('/role');
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.cooldownTimer);
  }

  resendPending(): void {
    const email = this.pendingEmail();
    if (!email || this.resending() || this.resendCooldown()) return;
    this.sendResend(email, () => this.startCooldown());
  }

  resendExpired(): void {
    this.resendForm.markAllAsTouched();
    if (this.resendForm.invalid || this.resending()) return;
    this.sendResend(this.resendForm.value.email as string, () => this.resent.set(true));
  }

  private sendResend(email: string, onSuccess: () => void): void {
    this.resending.set(true);
    this.authService.resendVerification(email).subscribe({
      next: (res) => {
        this.resending.set(false);
        this.commonService.openSnackBar(res.message);
        onSuccess();
      },
      error: (err) => {
        this.resending.set(false);
        const message = err instanceof HttpErrorResponse && err.error?.message
          ? err.error.message
          : 'Failed to resend verification link.';
        this.commonService.openSnackBar(message);
      }
    });
  }

  private startCooldown(): void {
    this.resendCooldown.set(true);
    clearTimeout(this.cooldownTimer);
    this.cooldownTimer = setTimeout(() => this.resendCooldown.set(false), RESEND_COOLDOWN_MS);
  }
}
