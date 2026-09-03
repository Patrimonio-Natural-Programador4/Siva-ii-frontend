import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { PageHeader } from '@shared';
import {
  AccionAprobacion,
  DialogResult,
} from '@shared/components/accion-aprobacion/accion-aprobacion';
import { AccionesSolicitudAprobacion } from 'src/app/models/acciones-solicitud-aprobacion';
import { EvaluacionCapacidadesModel } from 'src/app/models/evaluacion-capacidades';
import { ResponseRequest } from 'src/app/models/response-request';
import { SolicitudAprobacionHistorial } from 'src/app/models/solicitud-aprobacion-historial';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-evaluacion-capacidades-flujo-aprobacion',
  imports: [
    PageHeader,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
  ],
  templateUrl: './evaluacion-capacidades-flujo-aprobacion.html',
  styleUrl: './evaluacion-capacidades-flujo-aprobacion.scss',
})
export class EvaluacionCapacidadesFlujoAprobacion implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(EvaluacionCapacidadesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly tipoSolicitudAprobacion = 'APP_EC';
  isLinear = false;
  isLoadingAprobacion = false;
  isSavingAprobacion = false;
  guidEvaluacion = '';
  isLoading = false;
  habilitarAcciones = false;
  evaluacion: EvaluacionCapacidadesModel = {};
  historialAprobacion: SolicitudAprobacionHistorial[] = [];
  accionesAprobacion: AccionesSolicitudAprobacion = {};
  displayedColumnsAprobacion = [
    'rol',
    'usuario',
    'fecha_requerimiento',
    'fecha_aprobacion',
    'estado',
    'observaciones',
  ];

  userId: string | undefined | null;
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const guid = this.route.snapshot.paramMap.get('guid');
    if (guid) {
      this.guidEvaluacion = guid;
      this.getEvaluacion();
    } else {
      console.warn('No se encontró el parámetro guid');
      this.snackBar.open('No se recibió el identificador de la evaluación', '', { duration: 3000 });
      this.volver();
    }
  }

  volver(): void {
    this.router.navigate(['/acuerdos/evaluacion-capacidades']);
  }
  get hasHistorialAprobacion(): boolean {
    return this.historialAprobacion.length > 0;
  }
  /*
  private getEvaluacion(): void {
    this.isLoading = true;
    this.service.getPorGuid(this.guidEvaluacion).subscribe({
      next: data => {
        this.evaluacion = data;
        if (this.evaluacion.id) {
          this.getHistorialAprobacion(this.evaluacion.id);
        }
        this.getValidacionAccionesAprobacion();
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar la evaluación', '', { duration: 3000 });
        this.isLoading = false;
      },
    });
  } */

  private getEvaluacion(): void {
    this.isLoading = true;
    this.service.getPorGuid(this.guidEvaluacion).subscribe({
      next: data => {
        console.log('1. DATA RECIBIDA:', data);
        this.evaluacion = data;
        console.log('2. EVALUACION ASIGNADA:', this.evaluacion, 'guid:', this.evaluacion.guid);
        if (this.evaluacion.id) {
          this.getHistorialAprobacion(this.evaluacion.id);
        }
        this.getValidacionAccionesAprobacion();
        this.isLoading = false;
        console.log('3. isLoading:', this.isLoading);
      },
      error: err => {
        console.error('ERROR COMPLETO:', err);
        console.log('status:', err?.status);
        console.log('statusText:', err?.statusText);
        console.log('message:', err?.message);
        console.log('name:', err?.name);
        console.log('error.error (body):', err?.error);
        console.log('url:', err?.url);
        this.snackBar.open('Error al cargar la evaluación', '', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }
  private getHistorialAprobacion(idEvaluacion: number): void {
    this.service.getHistorialAprobacion(idEvaluacion).subscribe({
      next: data => (this.historialAprobacion = data ?? []),
      error: () => (this.historialAprobacion = []),
    });
  }
  private getValidacionAccionesAprobacion(): void {
    this.service.getValidacionAccionesAprobacion(this.guidEvaluacion).subscribe({
      next: response => {
        if (!response.solicitud_exitosa || !response.mensaje) {
          this.accionesAprobacion = {};
          return;
        }
        this.habilitarAcciones = response.solicitud_exitosa;
        const acciones = JSON.parse(response.mensaje);
        this.accionesAprobacion = {
          ...acciones,
          id_solicitud_aprobacion: this.evaluacion.approval_request_id,
        };
      },
      error: () => (this.accionesAprobacion = {}),
    });
  }
  abrirModalAccion(tipoAccion: 'APROBAR' | 'AJUSTAR'): void {
    const titulo = tipoAccion === 'APROBAR' ? 'Aprobar evaluación' : 'Solicitar ajustes';
    const dialogRef = this.dialog.open(AccionAprobacion, {
      width: '520px',
      disableClose: true,
      data: { titulo, tipoAccion, comentarios: this.accionesAprobacion.comentarios || '' },
    });
    dialogRef.componentInstance.usuarios_disponibles =
      this.accionesAprobacion.usuarios_disponibles_ajustes || [];
    dialogRef.afterClosed().subscribe((result: DialogResult | undefined) => {
      if (!result) return;
      this.accionesAprobacion.comentarios = result.comentarios;
      if (tipoAccion === 'AJUSTAR') {
        this.accionesAprobacion.id_usuario_ajuste = result.id_usuario_ajuste;
        this.accionesAprobacion.id_rol_aprobacion_ajuste = result.id_rol_aprobacion_ajuste;
      }
      this.ejecutarAccion(result.tipoAccion);
    });
  }
  private ejecutarAccion(tipoAccion: string): void {
    this.isLoading = true;
    // const payload = {
    //   id_solicitud_aprobacion: this.accionesAprobacion.id_solicitud_aprobacion,
    //   comentarios: this.accionesAprobacion.comentarios,
    //   tipo_accion: tipoAccion,
    //   tipo_solicitud: 'APP_EC',
    //   orden_actual: this.accionesAprobacion.orden_actual,
    //   id_usuario_ajuste: this.accionesAprobacion.id_usuario_ajuste ?? null,
    //   id_rol_aprobacion_ajuste: this.accionesAprobacion.id_rol_aprobacion_ajuste ?? null,
    // };

    this.accionesAprobacion.tipo_accion = tipoAccion;
    this.accionesAprobacion.tipo_solicitud = this.tipoSolicitudAprobacion;
    this.accionesAprobacion.evaluacion_capacidades = this.evaluacion;

    this.service.accionSolicitudAprobacion(this.guidEvaluacion, this.accionesAprobacion).subscribe({
      next: (response: ResponseRequest) => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open('Información guardada correctamente', '', { duration: 3000 });
          this.router.navigate(['/evaluaciones-capacidad/listar']);
        } else {
          this.snackBar.open(response.mensaje || 'La operación no fue exitosa', '', {
            duration: 3000,
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al procesar la solicitud', '', { duration: 3000 });
      },
    });
  }
}
