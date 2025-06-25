import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, EMPTY, map, switchMap } from 'rxjs';
import { CommonService } from '../../services/common.service';

@Component({
  standalone: false,
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  authService = inject(AuthService);
  commonService = inject(CommonService);
  router = inject(Router);

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(
      switchMap((params: any) => {
      const token = params.token;
      if (token) {  
        return this.authService.verifyEmail(token).pipe(
          map((res) => res.token),
          catchError(() => {
            this.commonService.openSnackBar("Verification failed. The link may be invalid or expired.");
            return EMPTY;
          })
        )
      }
      return EMPTY;
    })).subscribe({
      next: (token) => {
        localStorage.setItem("token", token);
        this.commonService.openSnackBar("Your email has been verified!");
        this.router.navigateByUrl("/role");
      }
    });
  }

} 