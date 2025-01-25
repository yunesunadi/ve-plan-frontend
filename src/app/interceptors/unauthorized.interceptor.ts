import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserPayload } from '../models/User';
import { jwtDecode } from 'jwt-decode';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const route = inject(Router);
  const token = localStorage.getItem("token") || "";
  const decoded: UserPayload = jwtDecode(token);

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        route.navigateByUrl(`${decoded.role}/dashboard/home`);
        return throwError(() => new Error(error as any));
      }
      return throwError(() => new Error(error));
    })
  );
};
