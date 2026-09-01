import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { RegisterWrapperComponent } from '../../shared/register-wrapper/register-wrapper.component';

@Component({
    selector: 'app-social-login-redirect',
    templateUrl: './social-login-redirect.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './social-login-redirect.component.scss',
    imports: [RegisterWrapperComponent]
})
export class SocialLoginRedirectComponent {
  activatedRoute = inject(ActivatedRoute);
  commonService = inject(CommonService);
  router = inject(Router);

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe({
      next: (params) => {
        const token = params.get("token")!;
        localStorage.setItem("token", token);
        history.replaceState(null, "", "/social_login_redirect");
        this.router.navigateByUrl("/role", { replaceUrl: true });
      }
    });
  }
}
