import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/ApiError';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const apiError = new ApiError(error);

      if (apiError.status === 401) {
        const token = localStorage.getItem("token");
        localStorage.removeItem("token");

        if (token) {
          router.navigateByUrl("login");
        }
      }

      return throwError(() => apiError);
    })
  );
};
