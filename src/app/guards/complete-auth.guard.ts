import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DashboardCacheService } from '../caches/dashboard-cache.service';

export const completeAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const cacheService = inject(DashboardCacheService);

  cacheService.has_role.subscribe({
    next: (res) => {
      if (!res.has_role && !authService.isLoggedIn()) {
        return false;
      }

      return true;
    }
  });
  
  return true;
};
