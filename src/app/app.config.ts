import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  importProvidersFrom,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideDateFnsDatetimeAdapter } from '@ng-matero/extensions-date-fns-adapter';
import { FORMLY_CONFIG, provideFormlyCore } from '@ngx-formly/core';
import { withFormlyMaterial } from '@ngx-formly/material';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { NgxPermissionsModule } from 'ngx-permissions';

import {
  BASE_URL,
  AuthService,
  interceptors,
  SettingsService,
  StartupService,
  TranslateLangService,
} from '@core';
import { environment } from '@env/environment';
import { formlyConfigFactory, PaginatorI18nService } from '@shared';
import { InMemDataService } from '@shared/in-mem/in-mem-data.service';
import { routes } from './app.routes';
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import {
  MsalInterceptor,
  MSAL_INSTANCE,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
} from '@azure/msal-angular';


let msalInstance: IPublicClientApplication;

export function MSALInstanceFactory(): IPublicClientApplication {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication({
      auth: {
        clientId: environment.adConfig.clientId,
        authority: `https://login.microsoftonline.com/${environment.adConfig.tenantId}`,
        knownAuthorities: ['login.microsoftonline.com'],
        redirectUri: `${environment.adConfig.redirectUri}`,
        postLogoutRedirectUri: '/',
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
      },
      system: {
        loggerOptions: {
          logLevel: LogLevel.Info,
          piiLoggingEnabled: false,
        },
      },
    });
  }
  return msalInstance;
}

export function initializeMsalInstance() {
  return () => {
    const instance = MSALInstanceFactory();
    return instance.initialize();
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  //have this set if more microservice used or requires different scope for different controllers
  protectedResourceMap.set(
    `${environment.adConfig.apiEndpointUrl}/*`, // Protect child API routes under /api
    environment.adConfig.scopeUrls
  );
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...environment.adConfig.scopeUrls],
    },
    loginFailedRoute: '/login-failed',
  };
}


export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'es-CO',
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'COP',
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
     {
      provide: APP_INITIALIZER,
      useFactory: initializeMsalInstance,
      multi: true
    },
    // Ahora sí, el resto de providers relacionados con MSAL
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: BASE_URL, useValue: environment.baseUrl },
    provideAppInitializer(() => inject(TranslateLangService).load()),
    provideAppInitializer(() => inject(StartupService).load()),
    provideHttpClient(withInterceptors(interceptors), withInterceptorsFromDi()),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withComponentInputBinding()
    ),
    provideHotToastConfig(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: 'i18n/', suffix: '.json' }),
    }),
    importProvidersFrom(
      NgxPermissionsModule.forRoot(),
      // 👇 ❌ This is only used for demo purpose, remove it in the realworld application
      InMemoryWebApiModule.forRoot(InMemDataService, {
        dataEncapsulation: false,
        passThruUnknownUrl: true,
      })
    ),
    provideFormlyCore([...withFormlyMaterial()]),
    {
      provide: FORMLY_CONFIG,
      useFactory: formlyConfigFactory,
      deps: [TranslateService],
      multi: true,
    },
    {
      provide: MatPaginatorIntl,
      useFactory: (paginatorI18nSrv: PaginatorI18nService) => paginatorI18nSrv.getPaginatorIntl(),
      deps: [PaginatorI18nService],
    },
    {
      provide: MAT_DATE_LOCALE,
      useFactory: () => inject(SettingsService).getLocale(),
    },
    {
      provide: MAT_CARD_CONFIG,
      useValue: {
        appearance: 'outlined',
      },
    },
    provideDateFnsAdapter({
      parse: {
        dateInput: 'yyyy-MM-dd',
      },
      display: {
        dateInput: 'yyyy-MM-dd',
        monthYearLabel: 'yyyy MMM',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'yyyy MMM',
      },
    }),
    provideDateFnsDatetimeAdapter({
      parse: {
        dateInput: 'yyyy-MM-dd',
        yearInput: 'yyyy',
        monthInput: 'MMMM',
        datetimeInput: 'yyyy-MM-dd HH:mm',
        timeInput: 'HH:mm',
      },
      display: {
        dateInput: 'yyyy-MM-dd',
        yearInput: 'yyyy',
        monthInput: 'MMMM',
        datetimeInput: 'yyyy-MM-dd HH:mm',
        timeInput: 'HH:mm',
        monthYearLabel: 'yyyy MMMM',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM yyyy',
        popupHeaderDateLabel: 'MMM dd, E',
      },
    }),
  ],
};
