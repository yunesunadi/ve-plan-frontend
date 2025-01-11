import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const unauthenticatedInterceptor: HttpInterceptorFn = (req, next) => {
  const route = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        route.navigateByUrl("login");
        return throwError(() => new Error(error as any));
      }
      return throwError(() => new Error(error));
    })
  );
};
