import { HttpHandlerFn, HttpRequest } from '@angular/common/http';

// Token injection is handled by MsalInterceptor (registered in HTTP_INTERCEPTORS in app.config.ts).
// This interceptor is kept empty so existing references in the interceptors array don't break.
export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  return next(req);
}
