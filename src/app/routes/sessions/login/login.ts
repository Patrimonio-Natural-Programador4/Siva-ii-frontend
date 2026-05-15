import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
  MsalService,
  MsalBroadcastService,
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
} from '@azure/msal-angular';
import { EventType, EventMessage } from '@azure/msal-browser';

import { AuthService } from '@core/authentication';
import { MatIcon } from '@angular/material/icon';
import { RedirectRequest } from 'node_modules/@azure/msal-browser/dist/request/RedirectRequest';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MtxButtonModule,
    TranslateModule,
    MatIcon
  ],
})
export class Login implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly msalGuardConfig = inject(MSAL_GUARD_CONFIG);
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);

  private readonly destroying$ = new Subject<void>();

  isSubmitting = false;

  loginForm = this.fb.nonNullable.group({
    username: ['ng-matero', [Validators.required]],
    password: ['ng-matero', [Validators.required]],
    rememberMe: [false],
  });

  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe')!;
  }

  ngOnInit() {
    // If the user is already authenticated, go straight to dashboard.
    if (this.auth.check()) {
      this.router.navigateByUrl('/');
      return;
    }

    // Process any in-flight MSAL redirect response (called after redirect back from Microsoft).
    this.msalService.handleRedirectObservable().subscribe();

    // Navigate to dashboard as soon as MSAL confirms login success.
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((event: EventMessage) => event.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        const account = this.msalService.instance.getAllAccounts()[0];
        if (account) {
          this.msalService.instance.setActiveAccount(account);
        }
        this.router.navigateByUrl('/');
      });
  }

  ngOnDestroy() {
    this.destroying$.next();
    this.destroying$.complete();
  }

  loginRedirect() {
    if (this.msalGuardConfig.authRequest) {
      this.msalService.loginRedirect({
        ...this.msalGuardConfig.authRequest
      } as RedirectRequest);
    } else {
      this.msalService.loginRedirect();
    }
  }
}
