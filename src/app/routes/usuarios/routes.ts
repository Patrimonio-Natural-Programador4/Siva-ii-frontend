import { Routes } from '@angular/router';
import { Listar } from './listar';
import { Acciones } from 'src/app/routes/usuarios/acciones/acciones';

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
        path: 'invitar',
        loadComponent: () => import('./acciones/acciones').then(m => m.Acciones),
        data: {
          title: 'Invitar usuario'
        }
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./acciones/acciones').then(m => m.Acciones),
        data: {
          title: 'Editar Usuario'
        }
      }
    ] 
  }
];
