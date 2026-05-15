import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Flujos de aprobación',
    },
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        loadComponent: () => import('./listar').then(m => m.ListarFlujosAprobacion),
        data: {
          title: 'Lista de flujos de aprobación',
        },
      },
      {
        path: 'crear',
        loadComponent: () => import('./acciones').then(m => m.AccionesFlujosAprobacion),
        data: {
          title: 'Crear flujo de aprobación',
        },
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./acciones').then(m => m.AccionesFlujosAprobacion),
        data: {
          title: 'Editar flujo de aprobación',
        },
      },
      {
        path: 'roles',
        loadComponent: () => import('./listar-roles').then(m => m.ListarRolesAprobacion),
        data: {
          title: 'Lista de roles de aprobación',
        },
      },
      {
        path: 'roles/crear',
        loadComponent: () => import('./acciones-roles').then(m => m.AccionesRolesAprobacion),
        data: {
          title: 'Crear rol de aprobación',
        },
      },
      {
        path: 'roles/editar/:id',
        loadComponent: () => import('./acciones-roles').then(m => m.AccionesRolesAprobacion),
        data: {
          title: 'Editar rol de aprobación',
        },
      },
      {
        path: 'delegacion',
        loadComponent: () => import('./delegacion-listar').then(m => m.ListarDelegacionesAprobacion),
        data: {
          title: 'Delegación de usuarios',
        },
      },
      {
        path: 'delegacion/crear',
        loadComponent: () => import('./delegacion-acciones').then(m => m.AccionesDelegacionAprobacion),
        data: {
          title: 'Crear delegación',
        },
      },
      {
        path: 'delegacion/editar/:id',
        loadComponent: () => import('./delegacion-acciones').then(m => m.AccionesDelegacionAprobacion),
        data: {
          title: 'Editar delegación',
        },
      },
    ],
  },
];