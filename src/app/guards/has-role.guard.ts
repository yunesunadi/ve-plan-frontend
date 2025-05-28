import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DashboardCacheService } from '../caches/dashboard-cache.service';

export const hasRoleGuard: CanActivateFn = (route, state) => {
  const cacheService = inject(DashboardCacheService);
  const router = inject(Router);

  cacheService.has_role.subscribe({
    next: (res) => {
      if (res.has_role) {
        if (res.role === "organizer") {
          router.navigateByUrl("organizer/dashboard/home");
        }
        if (res.role === "attendee") {
          router.navigateByUrl("attendee/dashboard/home");
        }
        return true;
      }

      router.navigateByUrl("role");
      return true;
    }
  });
  
  return true;
};
