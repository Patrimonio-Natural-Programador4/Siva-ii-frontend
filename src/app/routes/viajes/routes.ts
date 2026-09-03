import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Viajes',
    },
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        loadComponent: () => import('./listar').then(m => m.ListarViajes),
        data: {
          title: 'Lista de viajes',
        },
      },
      {
        path: 'calendario',
        loadComponent: () => import('./calendario/calendario').then(m => m.CalendarioViajes),
        data: {
          title: 'Calendario de viajes',
        },
      },
      {
        path: 'crear',
        loadComponent: () => import('./acciones/acciones').then(m => m.AccionesViajes),
        data: {
          title: 'Crear solicitud de viaje',
        },
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./acciones/acciones').then(m => m.AccionesViajes),
        data: {
          title: 'Editar solicitud de viaje',
        },
      },
      {
        path: 'detalle/:id',
        loadComponent: () => import('./detalle/detalle').then(m => m.Detalle),
        data: {
          title: 'Detalle de viaje',
        },
      },
      {
        path: 'legalizacion/:id',
        loadComponent: () =>
          import('./legalizacion/legalizacion').then(m => m.Legalizacion),
        data: {
          title: 'Detalle de legalización',
        },
      },
      {
        path: 'legalizacion/ver/:idviaje/:idleg',
        loadComponent: () =>
          import('./legalizacion/ver-detalle/ver-detalle').then(m => m.VerDetalleLegalizacion),
        data: {
          title: 'Ver detalle de legalización',
        },
      },
    ],
  },
];
