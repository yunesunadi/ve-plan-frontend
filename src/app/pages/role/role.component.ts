import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { FormsModule } from '@angular/forms';
import { filter, map } from 'rxjs';
import { RoleType, UserPayload } from '../../models/User';
import { jwtDecode } from 'jwt-decode';
import { ApiError } from '../../models/ApiError';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';
import { MatIcon } from '@angular/material/icon';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

interface RoleOption {
  value: RoleType;
  icon: string;
  title: string;
  description: string;
}

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './role.component.scss',
    imports: [RegisterWrapperComponent, FormsModule, MatIcon, SubmitButtonComponent]
})
export class RoleComponent {
  readonly roleOptions: RoleOption[] = [
    {
      value: 'organizer',
      icon: 'campaign',
      title: 'Organizer',
      description: 'Create events and sessions, invite and approve attendees, and host video meetings.',
    },
    {
      value: 'attendee',
      icon: 'confirmation_number',
      title: 'Attendee',
      description: 'Discover and register for events, accept invitations, and join video meetings.',
    },
  ];

  chosen_role = signal<RoleType | ''>('');
  submitting = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);
  private dashboardCache = inject(DashboardCacheService);

  confirmAndSubmit() {
    const role = this.chosen_role();
    if (!role || this.submitting()) return;

    this.confirmService.confirm({
      title: `Continue as ${this.roleOptions.find((option) => option.value === role)?.title}?`,
      body: 'Your role is permanent and cannot be changed later.',
      confirmLabel: 'Confirm role',
    }).pipe(
      filter(Boolean)
    ).subscribe(() => this.submitRole(role));
  }

  private submitRole(role: RoleType) {
    this.submitting.set(true);
    this.authService.setRole(role).pipe(
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
