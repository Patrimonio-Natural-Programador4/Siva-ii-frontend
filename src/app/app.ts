import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { PreloaderService, SettingsService } from '@core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet />
  `,
  imports: [RouterOutlet],
})
export class App implements OnInit, AfterViewInit {
  private readonly preloader = inject(PreloaderService);
  private readonly settings = inject(SettingsService);
  private readonly msalService = inject(MsalService);

  ngOnInit() {
    this.settings.setDirection();
    this.settings.setTheme();

    // Procesar cualquier redirect pendiente de MSAL en cada carga de la app.
    // Esto limpia el lock `interaction_in_progress` en sessionStorage si quedó
    // atascado por un redirect interrumpido (ej: tab en background, throttling).
    this.msalService.handleRedirectObservable().subscribe();
  }

  ngAfterViewInit() {
    this.preloader.hide();
  }
}
