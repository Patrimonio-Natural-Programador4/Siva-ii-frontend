import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Terminos de referencia (TDR)',
    },
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        loadComponent: () => import('./listar').then(m => m.ListarTdr),
        data: {
          title: 'Lista de TDR',
        },
      },
      {
        path: 'crear',
        loadComponent: () => import('./acciones/acciones').then(m => m.AccionesTdr),
        data: {
          title: 'Crear TDR',
        },
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./acciones/acciones').then(m => m.AccionesTdr),
        data: {
          title: 'Editar TDR',
        },
      },
      {
        path: 'detalle/:id',
        loadComponent: () => import('./detalle/detalle').then(m => m.DetalleTdr),
        data: {
          title: 'Detalle de TDR',
        },
      }
    ],
  },
];