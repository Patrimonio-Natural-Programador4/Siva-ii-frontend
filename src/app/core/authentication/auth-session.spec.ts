import { TestBed } from '@angular/core/testing';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  EventMessage,
  EventType,
  InteractionType,
  IPublicClientApplication,
} from '@azure/msal-browser';
import { NEVER, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginService } from './login.service';
import { TokenService } from './token.service';

describe('AuthService MSAL session events', () => {
  let auth: AuthService;
  let events: Subject<EventMessage>;
  let msal: jasmine.SpyObj<IPublicClientApplication>;

  beforeEach(() => {
    events = new Subject<EventMessage>();
    msal = jasmine.createSpyObj('MSAL', ['getActiveAccount', 'getAllAccounts', 'setActiveAccount']);
    msal.getActiveAccount.and.returnValue({
      homeAccountId: 'home',
      localAccountId: 'local',
      environment: 'login.microsoftonline.com',
      tenantId: 'tenant',
      username: 'test@example.com',
    });
    const tokenService = jasmine.createSpyObj<TokenService>('TokenService', ['change', 'refresh']);
    tokenService.change.and.returnValue(NEVER);
    tokenService.refresh.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: jasmine.createSpyObj('LoginService', ['menu']) },
        { provide: TokenService, useValue: tokenService },
        { provide: MsalService, useValue: { instance: msal } },
        { provide: MsalBroadcastService, useValue: { msalSubject$: events } },
      ],
    });
    auth = TestBed.inject(AuthService);
  });

  function emit(eventType: EventType) {
    events.next({
      eventType,
      interactionType: InteractionType.Silent,
      payload: null,
      error: null,
      timestamp: Date.now(),
      correlationId: 'session-test',
    });
  }

  it('does not restart menu loading on token acquisition or renewal', () => {
    const changed = jasmine.createSpy('changed');
    const subscription = auth.change().subscribe(changed);
    expect(changed).toHaveBeenCalledTimes(1);

    emit(EventType.ACQUIRE_TOKEN_SUCCESS);
    emit(EventType.ACQUIRE_TOKEN_SUCCESS);
    expect(changed).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  });

  it('still publishes session changes after login and explicit reload', () => {
    const changed = jasmine.createSpy('changed');
    const subscription = auth.change().subscribe(changed);

    emit(EventType.LOGIN_SUCCESS);
    auth.triggerInitialLoad();
    expect(changed).toHaveBeenCalledTimes(3);
    subscription.unsubscribe();
  });
});
