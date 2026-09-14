import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, shareReplay, tap, throwError } from 'rxjs';

import { Menu as CoreMenu } from '@core';
import { Menu as ApiMenu } from '../../models/menu';
import { UsuariosService } from '../../services/usuarios.service';
import { Token, User } from './interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly routeAliases = new Map([
    ['flujos-de-aprobacion', 'flujos-aprobacion'],
  ]);
  private menuCache$?: Observable<CoreMenu[]>;

  protected readonly http = inject(HttpClient);
  private readonly usuariosService = inject(UsuariosService);

  login(username: string, password: string, rememberMe = false) {
    return this.http
      .post<Token>('/auth/login', { username, password, rememberMe })
      .pipe(tap(() => this.clearMenuCache()));
  }

  refresh(params: Record<string, any>) {
    return this.http.post<Token>('/auth/refresh', params);
  }

  logout() {
    return this.http.post<any>('/auth/logout', {}).pipe(tap(() => this.clearMenuCache()));
  }

  user() {
    return this.http.get<User>('/user');
  }

  menu() {
    this.menuCache$ ??= this.usuariosService.getMenu().pipe(
      map(menu => this.buildMenu(menu)),
      catchError(error => {
        this.clearMenuCache();
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.menuCache$;
  }

  clearMenuCache(): void {
    this.menuCache$ = undefined;
  }

  private buildMenu(rows: ApiMenu[]): CoreMenu[] {
    const topLevelRows = rows.filter(row => !row.id_menu_padre);
    const parentRows = rows.filter(row => row.id_menu_padre);
    const menuByRoute = new Map<string, CoreMenu>();

    topLevelRows.forEach(row => {
      const route = this.getItemRoute(row);

      if (!route || menuByRoute.has(route)) {
        return;
      }

      menuByRoute.set(route, {
        route,
        name: row.nombre_menu || route,
        type: 'link',
        icon: row.icono || 'people',
      });
    });

    parentRows.forEach(row => {
      const parentRoute = this.getParentRoute(row);
      const childRoute = this.getItemRoute(row);

      if (!parentRoute || !childRoute) {
        return;
      }

      const parentMenu = menuByRoute.get(parentRoute) || {
        route: parentRoute,
        name: row.valor_padre || parentRoute,
        type: 'sub' as const,
        icon: row.icono_padre || row.icono || 'people',
        children: [],
      };

      parentMenu.type = 'sub';
      parentMenu.children = parentMenu.children || [];

      if (!parentMenu.children.some(child => child.route === childRoute)) {
        parentMenu.children.push({
          route: childRoute,
          name: row.nombre_menu || childRoute,
          type: 'link',
        });
      }

      menuByRoute.set(parentRoute, parentMenu);
    });

    const menu = Array.from(menuByRoute.values());
    this.sortMenu(menu, rows);

    return menu;
  }

  private sortMenu(menu: CoreMenu[], rows: ApiMenu[]): void {
    const parentOrder = new Map<string, number>();
    const childOrder = new Map<string, number>();

    rows.forEach(row => {
      const route = row.id_menu_padre ? this.getParentRoute(row) : this.getItemRoute(row);

      if (route && !parentOrder.has(route)) {
        parentOrder.set(route, row.id_menu_padre ? row.orden_padre || 0 : row.orden_menu || 0);
      }

      if (row.id_menu_padre) {
        const parentRoute = this.getParentRoute(row);
        const childRoute = this.getItemRoute(row);

        if (parentRoute && childRoute && !childOrder.has(`${parentRoute}/${childRoute}`)) {
          childOrder.set(`${parentRoute}/${childRoute}`, row.orden_menu || 0);
        }
      }
    });

    menu.sort((a, b) => (parentOrder.get(a.route) || 0) - (parentOrder.get(b.route) || 0));

    menu.forEach(item => {
      item.children?.sort(
        (a, b) =>
          (childOrder.get(`${item.route}/${a.route}`) || 0) -
          (childOrder.get(`${item.route}/${b.route}`) || 0)
      );
    });
  }

  private getParentRoute(row: ApiMenu): string {
    return this.normalizeRoute(row.url_padre || row.valor_padre || String(row.id_menu_padre));
  }

  private getItemRoute(row: ApiMenu): string {
    return this.normalizeRoute(row.url || row.nombre_menu);
  }

  private normalizeRoute(value?: string | null): string {
    const route = (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return this.routeAliases.get(route) || route;
  }
}
