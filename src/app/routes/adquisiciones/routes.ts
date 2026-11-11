import { Routes } from '@angular/router';
import { AdquisicionesTabla } from './adquisiciones-tabla/adquisiciones-tabla';
import { Title } from '@angular/platform-browser';

export const routes: Routes = [
  {
    path: '',
    data: {
      tittle: 'Adquisiciones',
    },

    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        loadComponent: () =>
          import('./adquisiciones-tabla/adquisiciones-tabla').then(m => m.AdquisicionesTabla),
        data: {
          tittle: 'Listado de adquisiciones',
        },
      },
    ],
  },
];
