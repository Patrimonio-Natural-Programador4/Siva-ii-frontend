import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Acuerdos',
    },
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'evaluacion-capacidades',
        loadComponent: () =>
          import('./evaluacion-capacidades/evaluacion-capacidades-tabla/evaluacion-capacidades-tabla').then(
            m => m.EvaluacionCapacidadesTabla
          ),
        data: {
          title: 'Aprobación de documentos',
        },
      },
      /* sacar esto aparte*/
      {
        path: 'evaluacion-capacidades/crear',
        loadComponent: () =>
          import('./evaluacion-capacidades/evaluacion-capacidades-formulario/evaluacion-capacidades-formulario').then(
            m => m.EvaluacionCapacidadesFormulario
          ),
        data: {
          title: 'Aprobación de documentos',
        },
      },
    ],
  },
];
