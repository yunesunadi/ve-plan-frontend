import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const hasRoleGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  userService.hasRole().subscribe({
    next: (res) => {
      if (res.has_role) {
        router.navigateByUrl("dashboard/home");
        return true;
      }

      router.navigateByUrl("role");
      return true;
    }
  });
  
  return true;
};
