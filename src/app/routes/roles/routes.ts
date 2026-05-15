import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Roles',
    },
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        loadComponent: () => import('./listar').then(m => m.ListarRoles),
        data: {
          title: 'Listar Roles',
        },
      },
      {
        path: 'crear',
        loadComponent: () => import('./acciones').then(m => m.AccionesRoles),
        data: {
          title: 'Crear Rol',
        },
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./acciones').then(m => m.AccionesRoles),
        data: {
          title: 'Editar Rol',
        },
      },
    ],
  },
];
