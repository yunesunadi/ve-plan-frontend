import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';

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
    this.authService.setRole(this.chosen_role).subscribe({
      next: () => {
        this.commonService.openSnackBar("Your account is successfully registered. Please login.");
        localStorage.removeItem("token");
        this.router.navigateByUrl("login");
      },
      error: (err) => {
        console.log("err", err);
      }
    })
  }
}
