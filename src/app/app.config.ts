import { ApplicationConfig, ErrorHandler, inject, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withNavigationErrorHandler, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withXhr, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { CommonService } from './services/common.service';
import { ApiError } from './models/ApiError';
import { GlobalErrorHandler } from './core/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withNavigationErrorHandler((navError) => {
        const err = navError.error;
        inject(CommonService).error(err instanceof ApiError ? err : 'Something went wrong.');
      }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(withXhr(), withInterceptors([
      authInterceptor,
      errorInterceptor,
    ])),
    provideNativeDateAdapter(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ]
};
