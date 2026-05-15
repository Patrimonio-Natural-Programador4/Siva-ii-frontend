import { Routes } from '@angular/router';
import { Listar } from './listar';
import { AccionesUsuarios } from 'src/app/routes/usuarios/acciones';

export const routes: Routes = [
  { 
    path: '',
    data: {
      title: 'Usuarios'
    },
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full'
      },
      {
        path: 'listar',
        loadComponent: () => import('./listar').then(m => m.Listar),
        data: {
          title: 'Listar Usuarios'
        }
      },
      {
        path: 'editar/:id',
        component: AccionesUsuarios,
        data: {
          title: 'Editar Usuario'
        }
      }
    ] 
  }
];
