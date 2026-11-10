import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { AuthenticationResult, IPublicClientApplication } from '@azure/msal-browser';
import { AuthService, User } from '@core/authentication';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { BehaviorSubject, NEVER, of, Subject, throwError } from 'rxjs';
import { Menu, MenuService } from './menu.service';
import { StartupService } from './startup.service';

describe('StartupService', () => {
  let startup: StartupService;
  let msal: jasmine.SpyObj<IPublicClientApplication>;
  let auth: jasmine.SpyObj<AuthService>;
  let menu: jasmine.SpyObj<MenuService>;
  let changes: BehaviorSubject<User>;
  let permissions: jasmine.SpyObj<NgxPermissionsService>;

  beforeEach(() => {
    msal = jasmine.createSpyObj('MSAL', [
      'initialize',
      'handleRedirectPromise',
      'setActiveAccount',
    ]);
    msal.initialize.and.returnValue(Promise.resolve());
    msal.handleRedirectPromise.and.returnValue(Promise.resolve(null));
    changes = new BehaviorSubject<User>({});
    auth = jasmine.createSpyObj('AuthService', ['triggerInitialLoad', 'change', 'menu']);
    auth.change.and.returnValue(changes);
    auth.menu.and.returnValue(of([]));
    menu = jasmine.createSpyObj('MenuService', ['set']);
    permissions = jasmine.createSpyObj('NgxPermissionsService', ['loadPermissions']);

    TestBed.configureTestingModule({
      providers: [
        { provide: MSAL_INSTANCE, useValue: msal },
        { provide: AuthService, useValue: auth },
        { provide: MenuService, useValue: menu },
        { provide: NgxPermissionsService, useValue: permissions },
        {
          provide: NgxRolesService,
          useValue: jasmine.createSpyObj('NgxRolesService', ['flushRoles', 'addRoles']),
        },
      ],
    });
    startup = TestBed.inject(StartupService);
    spyOn(console, 'error');
  });

  it('waits for redirect processing before loading the protected menu', fakeAsync(() => {
    let finishRedirect!: (result: AuthenticationResult | null) => void;
    msal.handleRedirectPromise.and.returnValue(new Promise(resolve => (finishRedirect = resolve)));
    let loaded = false;
    startup.load().then(() => (loaded = true));
    flushMicrotasks();

    expect(msal.initialize).toHaveBeenCalledTimes(1);
    expect(msal.handleRedirectPromise).toHaveBeenCalledTimes(1);
    expect(auth.menu).not.toHaveBeenCalled();
    expect(loaded).toBeFalse();

    const account = {
      homeAccountId: 'home',
      localAccountId: 'local',
      environment: 'login.microsoftonline.com',
      tenantId: 'tenant',
      username: 'test@example.com',
    };
    finishRedirect({
      account,
      authority: 'https://login.microsoftonline.com/tenant',
      uniqueId: 'local',
      tenantId: 'tenant',
      scopes: [],
      idToken: '',
      idTokenClaims: {},
      accessToken: '',
      fromCache: false,
      expiresOn: null,
      tokenType: 'Bearer',
      correlationId: 'test',
    });
    flushMicrotasks();

    expect(msal.setActiveAccount).toHaveBeenCalledWith(account);
    expect(auth.triggerInitialLoad).toHaveBeenCalled();
    expect(auth.menu).toHaveBeenCalledTimes(1);
    expect(menu.set).toHaveBeenCalledWith([]);
    expect(permissions.loadPermissions).toHaveBeenCalled();
    expect(loaded).toBeTrue();
  }));

  it('loads a cached session without requiring a redirect result', async () => {
    const items: Menu[] = [
      { route: 'dashboard', name: 'Dashboard', type: 'link', icon: 'dashboard' },
    ];
    auth.menu.and.returnValue(of(items));

    await startup.load();

    expect(msal.setActiveAccount).not.toHaveBeenCalled();
    expect(menu.set).toHaveBeenCalledWith(items);
  });

  it('keeps updating the menu on subsequent authentication changes', async () => {
    await startup.load();
    changes.next({ id: 'user' });
    changes.next({});

    expect(auth.menu).toHaveBeenCalledTimes(3);
    expect(menu.set).toHaveBeenCalledTimes(3);
  });

  it('does not finish startup before the menu arrives', fakeAsync(() => {
    const response = new Subject<Menu[]>();
    auth.menu.and.returnValue(response);
    let loaded = false;
    startup.load().then(() => (loaded = true));
    flushMicrotasks();
    expect(loaded).toBeFalse();

    response.next([]);
    flushMicrotasks();
    expect(loaded).toBeTrue();
  }));

  it('rejects startup when MSAL initialization fails', async () => {
    const error = new Error('MSAL unavailable');
    msal.initialize.and.callFake(() => Promise.reject(error));

    await expectAsync(startup.load()).toBeRejectedWith(error);
    expect(auth.menu).not.toHaveBeenCalled();
  });

  it('rejects startup when redirect processing fails', async () => {
    const error = new Error('Redirect failed');
    msal.handleRedirectPromise.and.callFake(() => Promise.reject(error));

    await expectAsync(startup.load()).toBeRejectedWith(error);
    expect(auth.menu).not.toHaveBeenCalled();
  });

  it('rejects startup instead of hiding a menu authentication failure', async () => {
    const error = new Error('Session expired');
    auth.menu.and.returnValue(throwError(() => error));

    await expectAsync(startup.load()).toBeRejectedWith(error);
    expect(menu.set).not.toHaveBeenCalled();
  });

  for (const stage of ['initialization', 'redirect', 'auth state', 'menu']) {
    it(`rejects after exactly 30 seconds if ${stage} stalls`, fakeAsync(() => {
      if (stage === 'initialization') {
        msal.initialize.and.returnValue(new Promise<void>(() => {}));
      } else if (stage === 'redirect') {
        msal.handleRedirectPromise.and.returnValue(new Promise(() => {}));
      } else if (stage === 'auth state') {
        auth.change.and.returnValue(NEVER);
      } else {
        auth.menu.and.returnValue(NEVER);
      }
      let failure: Error | undefined;
      startup.load().catch(error => (failure = error));
      flushMicrotasks();
      tick(29_999);
      expect(failure).toBeUndefined();
      tick(1);
      expect(failure?.name).toBe('TimeoutError');
      expect(menu.set).not.toHaveBeenCalled();
    }));
  }
});
