import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { environment } from '@env/environment';
import { EMPTY, finalize, NEVER } from 'rxjs';
import { UsuariosService } from '../../services/usuarios.service';
import { LoginService } from './login.service';

describe('LoginService menu cache', () => {
  let service: LoginService;
  let http: HttpTestingController;
  let users: UsuariosService;
  const url = `${environment.apiUrl2}/usuarios/menu`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LoginService);
    http = TestBed.inject(HttpTestingController);
    users = TestBed.inject(UsuariosService);
    spyOn(console, 'error');
  });

  afterEach(() => http.verify());

  it('shares an in-flight request and caches the successful menu', () => {
    const stream = service.menu();
    const results: string[] = [];
    stream.subscribe(menu => results.push(menu[0].route));
    service.menu().subscribe(menu => results.push(menu[0].route));
    http.expectOne(url).flush([{ nombre_menu: 'Dashboard', url: 'dashboard' }]);
    service.menu().subscribe(menu => results.push(menu[0].route));

    expect(results).toEqual(['dashboard', 'dashboard', 'dashboard']);
    http.expectNone(url);
  });

  it('cancels the backend request when no subscribers remain and allows retry', () => {
    const subscription = service.menu().subscribe();
    const request = http.expectOne(url);
    subscription.unsubscribe();
    expect(request.cancelled).toBeTrue();

    service.menu().subscribe();
    http.expectOne(url).flush([]);
  });

  it('does not cancel while another menu consumer still needs the request', () => {
    const first = service.menu().subscribe();
    const second = service.menu().subscribe();
    const request = http.expectOne(url);
    first.unsubscribe();
    expect(request.cancelled).toBeFalse();
    request.flush([]);
    second.unsubscribe();
  });

  it('times out at 30 seconds, cancels the request and clears the pending cache', fakeAsync(() => {
    let failure: Error | undefined;
    const firstStream = service.menu();
    firstStream.subscribe({ error: error => (failure = error) });
    const request = http.expectOne(url);

    tick(29_999);
    expect(failure).toBeUndefined();
    expect(request.cancelled).toBeFalse();
    tick(1);
    expect(failure?.name).toBe('TimeoutError');
    expect(request.cancelled).toBeTrue();
    expect(console.error).toHaveBeenCalled();

    expect(service.menu()).not.toBe(firstStream);
    service.menu().subscribe();
    http.expectOne(url).flush([]);
  }));

  it('releases a stalled token acquisition even when no request reaches the backend', fakeAsync(() => {
    const cancelled = jasmine.createSpy('cancelled');
    const getMenu = spyOn(users, 'getMenu').and.returnValue(NEVER.pipe(finalize(cancelled)));
    let failure: Error | undefined;
    service.menu().subscribe({ error: error => (failure = error) });
    http.expectNone(url);

    tick(30_000);
    expect(failure?.name).toBe('TimeoutError');
    expect(cancelled).toHaveBeenCalledTimes(1);

    getMenu.and.returnValue(EMPTY);
    service.menu().subscribe({ error: () => {} });
    expect(users.getMenu).toHaveBeenCalledTimes(2);
  }));

  it('invalidates an empty interceptor result rather than caching it indefinitely', () => {
    spyOn(users, 'getMenu').and.returnValue(EMPTY);
    let failure: Error | undefined;
    const firstStream = service.menu();
    firstStream.subscribe({ error: error => (failure = error) });

    expect(failure?.message).toContain('sin respuesta de autenticacion');
    expect(service.menu()).not.toBe(firstStream);
  });

  it('invalidates the cache after an HTTP error and retries with a fresh request', () => {
    service.menu().subscribe({ error: () => {} });
    http.expectOne(url).flush({}, { status: 401, statusText: 'Unauthorized' });

    service.menu().subscribe();
    http.expectOne(url).flush([]);
  });
});
