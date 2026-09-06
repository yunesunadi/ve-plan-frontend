import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { UserPayload } from '../../models/User';
import { CommonService } from '../../services/common.service';
import { ApiError } from '../../models/ApiError';
import { environment } from '../../../environments/environment';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './login.component.scss',
    imports: [RegisterWrapperComponent, MatButton, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatIconButton, MatSuffix, MatIcon, RouterLink, FormErrorComponent, SubmitButtonComponent]
})
export class LoginComponent {
  isPassword = signal(true);
  submitting = signal(false);
  login_form: FormGroup;

  private form_builder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private commonService = inject(CommonService);
  private dashboardCache = inject(DashboardCacheService);

  constructor() {
    this.login_form = this.form_builder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get emailControl() {
    return this.login_form.controls["email"];
  }

  get passwordControl() {
    return this.login_form.controls["password"];
  }

  togglePasswordVisibility() {
    this.isPassword.set(!this.isPassword());
  }

  submit() {
    this.login_form.markAllAsTouched();
    
    if (this.login_form.invalid) return;

    this.submitting.set(true);
    this.authService.login(this.login_form.value).pipe(
      map(res => res.token)
    ).subscribe({
      next: (token) => {
        this.submitting.set(false);
        this.commonService.success("Login successfully.");
        localStorage.setItem("token", token);
        this.dashboardCache.resetCurrentUser();
        this.dashboardCache.resetHasRole();

        const decoded: UserPayload = jwtDecode(token);
        this.router.navigateByUrl(`${decoded.role}/dashboard/home`);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
      }
    });
  }

  loginWithGoogle() {
    window.location.href = environment.google_oauth_url;
  }

  loginWithFacebook() {
    window.location.href = environment.facebook_oauth_url;
  }
}
