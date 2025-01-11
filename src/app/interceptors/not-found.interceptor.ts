import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const notFoundInterceptor: HttpInterceptorFn = (req, next) => {
  const route = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        route.navigateByUrl("not-found");
        return throwError(() => new Error(error as any));
      }
      return throwError(() => new Error(error));
    })
  );
};
