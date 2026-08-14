import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { DashboardCacheService } from '../caches/dashboard-cache.service';

export const hasRoleGuard: CanActivateFn = (route, state) => {
  const cacheService = inject(DashboardCacheService);
  const router = inject(Router);

  return cacheService.has_role.pipe(
    map((res) => {
      if (res.has_role) {
        return router.parseUrl(`${res.role}/dashboard/home`);
      }

      return true;
    })
  );
};
