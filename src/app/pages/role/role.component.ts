import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { map } from 'rxjs';
import { RoleType, UserPayload } from '../../models/User';
import { jwtDecode } from 'jwt-decode';
import { ApiError } from '../../models/ApiError';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './role.component.scss',
    imports: [RegisterWrapperComponent, ReactiveFormsModule, FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatError, FormErrorComponent, SubmitButtonComponent]
})
export class RoleComponent {
  roles: RoleType[] = ["organizer", "attendee"];
  chosen_role = "";
  submitting = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private commonService = inject(CommonService);
  private dashboardCache = inject(DashboardCacheService);

  submit(form: NgForm) {
    form.form.markAllAsTouched();

    if (form.invalid) return;

    this.submitting.set(true);
    this.authService.setRole(this.chosen_role).pipe(
      map(res => res.token)
    ).subscribe({
      next: (token) => {
        this.submitting.set(false);
        this.commonService.success("Your account is successfully registered.");
        localStorage.setItem("token", token);
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
    })
  }
}
