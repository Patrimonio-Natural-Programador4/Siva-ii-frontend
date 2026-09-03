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

      //sacar esto aparte
      {
        path: 'estudios-previos/crear',
        loadComponent: () =>
          import('./estudios-previos/estudios-previos-formulario/estudios-previos-formulario').then(
            m => m.EstudiosPreviosFormulario
          ),
        data: {
          title: 'Creación estudios previos',
        },
      },

      {
        path: 'estudios-previos/detalle',
        loadComponent: () =>
          import('./estudios-previos/estudios-previos-flujo/estudios-previos-flujo').then(
            m => m.EstudiosPreviosFlujo
          ),
        data: {
          title: 'Detalle estudios previos',
        },
      },

      {
        path: 'estudios-previos',
        loadComponent: () =>
          import('./estudios-previos/estudios-previos-tabla/estudios-previos-tabla').then(
            m => m.EstudiosPreviosTabla
          ),
        data: {
          title: 'Estudios previos',
        },
      },

      {
        path: 'evaluacion-capacidades',
        loadComponent: () =>
          import('./evaluacion-capacidades/evaluacion-capacidades-tabla/evaluacion-capacidades-tabla').then(
            m => m.ListarEvaluacionesCapacidad
          ),
        data: {
          title: 'Evaluación de capacidades',
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
          title: 'Crear evaluación de capacidades',
        },
      },
      {
        path: 'evaluacion-capacidades/detalle/:guid',
        loadComponent: () =>
          import('./evaluacion-capacidades/evaluacion-capacidades-flujo-aprobacion/evaluacion-capacidades-flujo-aprobacion').then(
            m => m.EvaluacionCapacidadesFlujoAprobacion
          ),
        data: {
          title: 'Detalle evaluacion de capacidades',
        },
      },
      {
        path: 'evaluacion-capacidades/editar/:guid',
        loadComponent: () =>
          import('./evaluacion-capacidades/evaluacion-capacidades-formulario/evaluacion-capacidades-formulario').then(
            m => m.EvaluacionCapacidadesFormulario
          ),
        data: {
          title: 'Editar evaluación de capacidades',
        },
      },
    ],
  },
];
