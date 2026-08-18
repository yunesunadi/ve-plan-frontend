import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { map } from 'rxjs';
import { RoleType, UserPayload } from '../../models/User';
import { jwtDecode } from 'jwt-decode';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './role.component.scss',
    imports: [RegisterWrapperComponent, ReactiveFormsModule, FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatError, MatButton]
})
export class RoleComponent {
  roles: RoleType[] = ["organizer", "attendee"];
  chosen_role = "";

  private authService = inject(AuthService);
  private router = inject(Router);
  private commonService = inject(CommonService);
  private dashboardCache = inject(DashboardCacheService);

  submit() {
    this.authService.setRole(this.chosen_role).pipe(
      map(res => res.token)
    ).subscribe({
      next: (token) => {
        this.commonService.openSnackBar("Your account is successfully registered.");
        localStorage.setItem("token", token);
        this.dashboardCache.resetHasRole();

        const decoded: UserPayload = jwtDecode(token);
        this.router.navigateByUrl(`${decoded.role}/dashboard/home`);
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    })
  }
}
