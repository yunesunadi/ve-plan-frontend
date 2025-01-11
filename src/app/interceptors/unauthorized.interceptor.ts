import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const route = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        route.navigateByUrl("dashboard/home");
        return throwError(() => new Error(error as any));
      }
      return throwError(() => new Error(error));
    })
  );
};
