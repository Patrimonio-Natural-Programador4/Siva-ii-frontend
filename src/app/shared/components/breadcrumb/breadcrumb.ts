import { Component, OnInit, ViewEncapsulation, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, startWith } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [MatIconModule, TranslateModule, RouterLink],
})
export class Breadcrumb implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly nav = input<string[]>([]);

  navItems: BreadcrumbItem[] = [];

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(this.router)
      )
      .subscribe(() => {
        this.genBreadcrumb();
      });
  }

  genBreadcrumb() {
    // Si se proporciona un array personalizado, usarlo
    if (this.nav().length > 0) {
      this.navItems = this.nav().map((label, index) => ({
        label,
        url: this.nav().slice(0, index + 1).join('/')
      }));
      return;
    }

    // Extraer breadcrumb desde el árbol de rutas usando data.title
    const breadcrumbs: BreadcrumbItem[] = [];
    let route = this.activatedRoute.root;
    let url = '';

    while (route) {
      const routePath = route.snapshot.url.map(u => u.path).join('/');
      if (routePath) {
        url += `/${routePath}`;
      }
      
      // Procesar la ruta actual si tiene data.title
      if (route.snapshot.data['title']) {
        breadcrumbs.push({
          label: route.snapshot.data['title'],
          url: url || '/'
        });
      }

      // Avanzar por la rama activa
      if (!route.firstChild) {
        break;
      }

      route = route.firstChild;
    }

    // Agregar "home" al inicio si no está vacío
    if (breadcrumbs.length > 0) {
      breadcrumbs.unshift({
        label: 'home',
        url: '/'
      });
    }

    this.navItems = breadcrumbs;
  }
}
