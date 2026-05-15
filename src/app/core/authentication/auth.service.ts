import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, iif, map, merge, of, share, startWith, switchMap, tap } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AccountInfo, EventMessage, EventType } from '@azure/msal-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { filterObject, isEmptyObject } from './helpers';
import { User } from './interface';
import { LoginService } from './login.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginService = inject(LoginService);
  private readonly tokenService = inject(TokenService);
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);

  private user$ = new BehaviorSubject<User>({});

  /** Subject que emite para forzar carga inicial del menú. */
  private initTrigger$ = new BehaviorSubject<void>(undefined);

  /** Emits whenever the MSAL auth state changes (login, token renewal, silent SSO). */
  private msalChange$ = this.msalBroadcastService.msalSubject$.pipe(
    filter(
      (event: EventMessage) =>
        event.eventType === EventType.LOGIN_SUCCESS ||
        event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
    )
  );

  private change$ = merge(
    this.tokenService.change(),
    this.tokenService.refresh().pipe(switchMap(() => this.refresh())),
    this.msalChange$,
    this.initTrigger$ // Emite al inicial para cargar menú si hay sesión activa
  ).pipe(
    switchMap(() => this.assignUser()),
    tap(() => console.log('AuthService: Usuario actualizado, menú debería cargarse')),
    share()
  );

  init() {
    return new Promise<void>(resolve => this.change$.subscribe(() => resolve()));
  }

  /** Dispara el cargue inicial del menú cuando MSAL está listo. */
  triggerInitialLoad() {
    this.initTrigger$.next();
  }

  change() {
    return this.change$;
  }

  check() {
    return !!this.getOrSetActiveMsalAccount();
  }

  login(username: string, password: string, rememberMe = false) {
    return this.loginService.login(username, password, rememberMe).pipe(
      tap(token => this.tokenService.set(token)),
      map(() => this.check())
    );
  }

  refresh() {
    return this.loginService
      .refresh(filterObject({ refresh_token: this.tokenService.getRefreshToken() }))
      .pipe(
        catchError(() => of(undefined)),
        tap(token => this.tokenService.set(token)),
        map(() => this.check())
      );
  }

  logout() {
    this.tokenService.clear();
    this.user$.next({});

    if (!this.check()) {
      return of(true);
    }

    return this.msalService.logoutRedirect({ postLogoutRedirectUri: '/auth/login' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  user() {
    return this.user$.pipe(share());
  }

  menu() {
    return iif(() => this.check(), this.loginService.menu(), of([]));
  }

  private assignUser() {
    if (!this.check()) {
      return of({}).pipe(tap(user => this.user$.next(user)));
    }

    if (!isEmptyObject(this.user$.getValue())) {
      return of(this.user$.getValue());
    }

    const msalUser = this.buildUserFromMsalAccount();
    if (msalUser) {
      return of(msalUser).pipe(tap(user => this.user$.next(user)));
    }

    return this.loginService.user().pipe(tap(user => this.user$.next(user)));
  }

  private getOrSetActiveMsalAccount() {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (activeAccount) {
      return activeAccount;
    }

    const availableAccounts = this.msalService.instance.getAllAccounts();
    if (!availableAccounts.length) {
      return null;
    }

    this.msalService.instance.setActiveAccount(availableAccounts[0]);
    return availableAccounts[0];
  }

  private buildUserFromMsalAccount(): User | null {
    const account = this.getOrSetActiveMsalAccount();
    if (!account) {
      return null;
    }

    return {
      id: account.localAccountId || account.homeAccountId,
      name: account.name || account.username,
      email: account.username,
      avatar: 'https://www.gravatar.com/avatar/?d=mp',
      roles: this.getRolesFromClaims(account),
      permissions: [],
    };
  }

  private getRolesFromClaims(account: AccountInfo): string[] {
    const roles = account.idTokenClaims?.['roles'];

    if (Array.isArray(roles)) {
      return roles.map(role => `${role}`);
    }

    return [];
  }
}
