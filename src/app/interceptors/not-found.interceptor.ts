import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, throwError } from 'rxjs';
import { UserPayload } from '../models/User';

export const notFoundInterceptor: HttpInterceptorFn = (req, next) => {
  const route = inject(Router);
  const token = localStorage.getItem("token");

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        if (token) {
          route.navigateByUrl(`${(jwtDecode(token) as UserPayload).role}/dashboard/not-found`);
        }
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};
