import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, of, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { EventService } from '../services/event.service';
import { Event } from '../models/Event';
import { ApiError } from '../models/ApiError';
import { UserPayload } from '../models/User';

function findEventId(route: ActivatedRouteSnapshot): string {
  let current: ActivatedRouteSnapshot | null = route;

  while (current) {
    const id = current.paramMap.get('id');
    if (id) {
      return id;
    }
    current = current.parent;
  }

  throw new Error('eventResolver: no :id route parameter found in the route ancestry.');
}

export const eventResolver: ResolveFn<Event> = (route) => {
  const eventService = inject(EventService);
  const router = inject(Router);
  const id = findEventId(route);

  return eventService.getOneById(id).pipe(
    map((res) => res.data),
    catchError((err: unknown) => {
      if (err instanceof ApiError && err.kind === 'notFound') {
        const token = localStorage.getItem('token') || '';
        const role = (jwtDecode(token) as UserPayload).role;
        return of(new RedirectCommand(router.parseUrl(`${role}/dashboard/not-found`)));
      }

      return throwError(() => err);
    }),
  );
};
