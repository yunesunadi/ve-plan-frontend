import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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

  submit() {
    this.authService.setRole(this.chosen_role).subscribe({
      next: () => {
        this.router.navigateByUrl("dashboard/home");
      },
      error: (err) => {
        console.log("err", err);
      }
    })
  }
}
