import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';
import { AuthService, User } from '@core/authentication';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { defer, switchMap, tap, timeout } from 'rxjs';
import { Menu, MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  private readonly authService = inject(AuthService);
  private readonly msalInstance = inject(MSAL_INSTANCE) as IPublicClientApplication;
  private readonly menuService = inject(MenuService);
  private readonly permissonsService = inject(NgxPermissionsService);
  private readonly rolesService = inject(NgxRolesService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */
  load() {
    return new Promise<void>((resolve, reject) => {
      defer(() => this.msalInstance.initialize())
        .pipe(
          // Finish redirect processing before protected requests can renew the session.
          switchMap(() => this.msalInstance.handleRedirectPromise()),
          tap(result => {
            if (result?.account) {
              this.msalInstance.setActiveAccount(result.account);
            }
            this.authService.triggerInitialLoad();
          }),
          switchMap(() => this.authService.change()),
          tap(user => this.setPermissions(user)),
          switchMap(() => this.authService.menu().pipe(timeout({ first: 30_000 }))),
          tap(menu => this.setMenu(menu)),
          timeout({ first: 30_000 }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => resolve(),
          error: err => {
            console.error('StartupService: Error al cargar', err);
            reject(err);
          },
        });
    });
  }

  private setMenu(menu: Menu[]) {
    this.menuService.set(menu);
  }

  private setPermissions(user: User) {
    // In a real app, you should get permissions and roles from the user information.
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    this.permissonsService.loadPermissions(permissions);
    this.rolesService.flushRoles();
    this.rolesService.addRoles({ ADMIN: permissions });

    // Tips: Alternatively you can add permissions with role at the same time.
    // this.rolesService.addRolesWithPermissions({ ADMIN: permissions });
  }
}
