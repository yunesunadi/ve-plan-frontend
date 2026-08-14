import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { DashboardCacheService } from '../caches/dashboard-cache.service';

export const completeAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const cacheService = inject(DashboardCacheService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  return cacheService.has_role.pipe(
    map((res) => {
      if (!res.has_role) {
        return router.parseUrl('/role');
      }

      const expected_role = state.url.startsWith('/organizer') ? 'organizer' : 'attendee';

      if (res.role !== expected_role) {
        return router.parseUrl(`/${res.role}/dashboard/home`);
      }

      return true;
    })
  );
};
