import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withXhr, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { authInterceptor } from './interceptors/auth.interceptor';
import { notFoundInterceptor } from './interceptors/not-found.interceptor';
import { unauthenticatedInterceptor } from './interceptors/unauthenticated.interceptor';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withXhr(), withInterceptors([
      authInterceptor,
      notFoundInterceptor,
      unauthenticatedInterceptor,
      unauthorizedInterceptor,
    ])),
    provideNativeDateAdapter(),
  ]
};
