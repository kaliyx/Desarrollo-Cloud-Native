import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalInterceptor } from '@azure/msal-angular';
import { catchError, throwError } from 'rxjs';

export const msalInterceptorFn: HttpInterceptorFn = (request, next) =>
  inject(MsalInterceptor).intercept(request, { handle: next });

export const authErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: { status?: number }) => {
      if (error.status === 401 || error.status === 403) {
        window.dispatchEvent(new CustomEvent('auth-http-error', {
          detail: { status: error.status },
        }));
      }

      return throwError(() => error);
    })
  );
