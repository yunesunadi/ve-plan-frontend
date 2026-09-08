import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const completeAuthGuard: CanMatchFn = (route, _segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  const role = authService.role();

  if (!role) {
    return router.parseUrl('/role');
  }

  const expectedRole = route.path?.startsWith('organizer') ? 'organizer' : 'attendee';

  if (role !== expectedRole) {
    return router.parseUrl(`/${role}/dashboard/home`);
  }

  return true;
};
