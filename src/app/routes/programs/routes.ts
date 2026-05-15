import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Programas',
    },
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        loadComponent: () => import('./listar').then(m => m.ListarPrograms),
        data: {
          title: 'Listar Programas',
        },
      },
      {
        path: 'crear',
        loadComponent: () => import('./acciones').then(m => m.AccionesPrograms),
        data: {
          title: 'Crear Programa',
        },
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./acciones').then(m => m.AccionesPrograms),
        data: {
          title: 'Editar Programa',
        },
      }
    ],
  },
];
