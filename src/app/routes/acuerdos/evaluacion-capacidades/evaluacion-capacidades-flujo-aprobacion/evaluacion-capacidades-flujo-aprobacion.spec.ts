import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MtxDrawer } from '@ng-matero/extensions/drawer';
import { of, Subject } from 'rxjs';
import { DialogResult } from '@shared/components/accion-aprobacion/accion-aprobacion';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';

import { EvaluacionCapacidadesFlujoAprobacion } from './evaluacion-capacidades-flujo-aprobacion';

describe('EvaluacionCapacidadesFlujoAprobacion', () => {
  let component: EvaluacionCapacidadesFlujoAprobacion;
  let closed: Subject<DialogResult | undefined>;
  let open: jasmine.Spy;
  let service: jasmine.SpyObj<EvaluacionCapacidadesService>;

  beforeEach(async () => {
    closed = new Subject<DialogResult | undefined>();
    open = jasmine.createSpy('open').and.returnValue({
      componentInstance: { usuarios_disponibles: [] },
      afterClosed: () => closed.asObservable(),
    });
    service = jasmine.createSpyObj<EvaluacionCapacidadesService>('EvaluacionCapacidadesService', [
      'accionSolicitudAprobacion',
    ]);
    service.accionSolicitudAprobacion.and.returnValue(
      of({ solicitud_exitosa: false, mensaje: 'Respuesta de prueba' })
    );
    await TestBed.configureTestingModule({
      imports: [EvaluacionCapacidadesFlujoAprobacion],
      providers: [
        { provide: Router, useValue: { url: '', navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: {} },
        { provide: EvaluacionCapacidadesService, useValue: service },
        { provide: FlujosAprobacionService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('snackBar') } },
        { provide: MatDialog, useValue: { open } },
        { provide: MtxDrawer, useValue: {} },
      ],
    })
      .overrideTemplate(EvaluacionCapacidadesFlujoAprobacion, '')
      .compileComponents();
    component = TestBed.createComponent(EvaluacionCapacidadesFlujoAprobacion).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const tipoAccion of ['APROBAR', 'AJUSTAR'] as const) {
    it(`passes available roles to the modal and includes assignments in ${tipoAccion}`, () => {
      const roles = [
        {
          rol: 'REVISOR',
          rol_id: 20,
          users: [{ user_id: 86, name: 'Usuario C' }],
        },
      ];
      component.accionesAprobacion = { roles_disponibles_asignar: roles };
      component.abrirModalAccion(tipoAccion);
      expect(open).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({
          data: jasmine.objectContaining({ roles_disponibles_asignar: roles }),
        })
      );
      closed.next({
        tipoAccion,
        comentarios: 'Comentario',
        id_usuario_ajuste: 82,
        id_rol_aprobacion_ajuste: 5,
        roles_asignados: roles,
      });
      expect(component.accionesAprobacion.roles_asignados).toEqual(roles);
      expect(service.accionSolicitudAprobacion).toHaveBeenCalledWith(
        component.guidEvaluacion,
        jasmine.objectContaining({ roles_asignados: roles, tipo_accion: tipoAccion })
      );
    });
  }

  it('does not change assignments or submit the action on cancellation', () => {
    const roles = [
      {
        rol: 'REVISOR',
        rol_id: 20,
        users: [{ user_id: 86, name: 'Usuario C' }],
      },
    ];
    component.accionesAprobacion = { roles_asignados: roles };
    component.abrirModalAccion('APROBAR');
    closed.next(undefined);
    expect(component.accionesAprobacion.roles_asignados).toEqual(roles);
    expect(service.accionSolicitudAprobacion).not.toHaveBeenCalled();
  });
});
