import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { map } from 'rxjs';
import { UserPayload } from '../../models/User';
import { jwtDecode } from 'jwt-decode';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss'
})
export class RoleComponent {
  roles = ["organizer", "attendee"];
  chosen_role = "";

  private authService = inject(AuthService);
  private router = inject(Router);
  private commonService = inject(CommonService);

  submit() {
    this.authService.setRole(this.chosen_role).pipe(
      map(res => res.token)
    ).subscribe({
      next: (token) => {
        this.commonService.openSnackBar("Your account is successfully registered.");
        localStorage.setItem("token", token);
        
        const decoded: UserPayload = jwtDecode(token);

        if (decoded.role === "organizer") {
          this.router.navigateByUrl("organizer/dashboard/home");
        }

        if (decoded.role === "attendee") {
          this.router.navigateByUrl("attendee/dashboard/home");
        }   
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    })
  }
}
