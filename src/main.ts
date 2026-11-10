import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch(err => {
  console.error('No fue posible iniciar la aplicacion', err);

  const loader = document.getElementById('globalLoader');
  if (!loader) {
    return;
  }

  const message = document.createElement('p');
  message.textContent =
    'No fue posible iniciar la aplicacion. Verifique su conexion y reintente. ' +
    'Si su sesion vencio, se solicitara iniciar sesion nuevamente.';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Reintentar';
  retry.addEventListener('click', () => window.location.reload());

  loader.classList.remove('global-loader-fade-out', 'global-loader-hidden');
  loader.style.flexDirection = 'column';
  loader.style.padding = '24px';
  loader.setAttribute('role', 'alert');
  loader.replaceChildren(message, retry);
});
