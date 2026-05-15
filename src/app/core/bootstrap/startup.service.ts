import { Injectable, inject } from '@angular/core';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';
import { AuthService, User } from '@core/authentication';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { switchMap, tap, startWith } from 'rxjs';
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

  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */
  load() {
    return new Promise<void>((resolve, reject) => {
      this.msalInstance
        .initialize()
        .then(() => {
          // Trigger initial load to ensure menu loads even if session was already active
          this.authService.triggerInitialLoad();

          this.authService
            .change()
            .pipe(
              tap(user => {
                console.log('StartupService: Permisos establecidos para usuario', user);
                this.setPermissions(user);
              }),
              switchMap(() => {
                console.log('StartupService: Cargando menú...');
                return this.authService.menu();
              }),
              tap(menu => {
                console.log('StartupService: Menú cargado', menu);
                this.setMenu(menu);
              })
            )
            .subscribe({
              next: () => {
                console.log('StartupService: Carga completada');
                resolve();
              },
              error: err => {
                console.error('StartupService: Error al cargar', err);
                resolve();
              },
            });
        })
        .catch(err => {
          console.error('StartupService: Error inicializando MSAL', err);
          resolve();
        });
    });
  }

  private setMenu(menu: Menu[]) {
    this.menuService.addNamespace(menu, 'menu');
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
