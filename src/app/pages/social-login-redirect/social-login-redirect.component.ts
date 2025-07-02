import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';

@Component({
  standalone: false,
  selector: 'app-social-login-redirect',
  templateUrl: './social-login-redirect.component.html',
  styleUrl: './social-login-redirect.component.scss'
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
        this.router.navigateByUrl("/role");
      }
    });
  }
}
