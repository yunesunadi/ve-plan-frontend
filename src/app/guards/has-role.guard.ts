import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const hasRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  userService.hasRole().subscribe({
    next: (res) => {
      if (authService.isLoggedIn() && res.has_role) {
        router.navigateByUrl("dashboard/home");
        return true;
      } else {
        router.navigateByUrl("login");
        return false;
      }
    }
  });
  
  return true;
};
