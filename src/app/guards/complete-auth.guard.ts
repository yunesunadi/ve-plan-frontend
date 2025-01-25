import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

export const completeAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);

  userService.hasRole().subscribe({
    next: (res) => {
      if (!res.has_role && !authService.isLoggedIn()) {
        return false;
      }

      return true;
    }
  });
  
  return true;
};
