import { Login } from './../../../sessions/login/login';
import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeader } from '@shared';
import { EstudiosPreviosService } from 'src/app/services/estudios-previos/estudios-previos.service';
import { AccionesSolicitudAprobacion } from 'src/app/models/acciones-solicitud-aprobacion';
import { SolicitudAprobacionHistorial } from 'src/app/models/solicitud-aprobacion-historial';
import {
  AccionAprobacion,
  DialogResult,
} from '@shared/components/accion-aprobacion/accion-aprobacion';
import { ResponseRequest } from 'src/app/models/response-request';
import { environment } from '@env/environment';

@Component({
  selector: 'app-estudios-previos-flujo',
  imports: [
    PageHeader,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './estudios-previos-flujo.html',
  styleUrl: './estudios-previos-flujo.scss',
})
export class EstudiosPreviosFlujo implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly EstudiosPreviosService = inject(EstudiosPreviosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly urlActual = this.router.url;

  estudio_Previo_Id = 0;
  isLoadingDetail = false;
  isLoading = false;
  isLinear = false;
  isLoadingAprobacion = false;
  isSavingAprobacion = false;
  habilitarAcciones = false;
  guidEstudio = '';
  estudio: PreviousStudiesModel = {};
  historialAprobacion: SolicitudAprobacionHistorial[] = [];
  estudioData: PreviousStudiesModel = {};
  accionesAprobacion: AccionesSolicitudAprobacion = {};
  tipoSolicitudAprobacion: string | undefined;

  displayedColumnsAprobacion: string[] = [
    'rol',
    'usuario',
    'fecha_requerimiento',
    'fecha_aprobacion',
    'estado',
    'observaciones',
  ];

  userId: string | undefined | null;
  private route = inject(ActivatedRoute);

  //constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    const guid = this.route.snapshot.paramMap.get('guid');
    if (guid) {
      this.guidEstudio = guid;
      this.getEstudioPrevio();
    } else {
      console.warn('No se encontró el parámetro guid');
      this.snackBar.open('No se recibió el identificador de la estudio previo', '', {
        duration: 3000,
      });
      this.volver();
    }
  }

  cargarDetalle(id: number): void {
    this.isLoading = true;

    this.EstudiosPreviosService.getEstPreviosById(id).subscribe({
      next: (res: any) => {
        this.estudioData = res?.data ? res.data : res;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error cargando estudios previos:', err);
        this.snackBar.open('Error al cargar la información', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  volver(): void {
    this.router.navigate(['./estudios-previos/estudios-previos-tabla/estudios-previos-tabla']);
  }

  private getEstudioPrevio(): void {
    this.isLoading = true;
    console.log('guidest', this.guidEstudio);

    this.EstudiosPreviosService.getPorGuid(this.guidEstudio).subscribe({
      next: data => {
        console.log('1. DATA RECIBIDA:', data);
        this.estudio = data;
        console.log('2. EVALUACION ASIGNADA:', this.estudio, 'guid:', this.estudio.guid);
        if (this.estudio.id) {
          this.estudio_Previo_Id = this.estudio.id;
          this.isLoading = false;
          this.getHistorialAprobacion(this.estudio.id);
        }
        this.getValidacionAccionesAprobacion();
        this.isLoading = false;
        console.log('3. isLoading:', this.isLoading);
      },
      error: err => {
        console.error('ERROR COMPLETO:', err);
        console.dir(err);
        console.log('JSON:', JSON.stringify(err));
        console.log('status:', err?.status);
        console.log('statusText:', err?.statusText);
        console.log('message:', err?.message);
        console.log('name:', err?.name);
        console.log('error.error (body):', err?.error);
        console.log('url:', err?.url);
        this.snackBar.open('Error al cargar la estudio previo', '', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  private getHistorialAprobacion(idEstudio: number): void {
    this.EstudiosPreviosService.getHistorialAprobacion(idEstudio).subscribe({
      next: data => {
        this.historialAprobacion = data ?? [];
        this.cdr.detectChanges();
        console.log('HISTORIAL APROBACION', this.historialAprobacion);
      },
      error: () => {
        this.historialAprobacion = [];
        this.cdr.detectChanges();
      },
    });
  }

  private getValidacionAccionesAprobacion(): void {
    this.EstudiosPreviosService.getValidacionAccionesAprobacion(this.guidEstudio).subscribe({
      next: response => {
        if (!response.solicitud_exitosa || !response.mensaje) {
          this.accionesAprobacion = {};
          return;
        }
        this.habilitarAcciones = response.solicitud_exitosa;
        const acciones = JSON.parse(response.mensaje);
        this.accionesAprobacion = {
          ...acciones,
          id_solicitud_aprobacion: this.estudio.approval_request_id,
        };
      },
      error: () => (this.accionesAprobacion = {}),
    });
  }

  get hasHistorialAprobacion(): boolean {
    return this.historialAprobacion.length > 0;
  }

  get habilitarAccionesAprobacion(): boolean {
    return !!this.accionesAprobacion.id_solicitud_aprobacion;
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
    this.isLoadingDetail = true;
    console.log('>>> isLoadingDetail = true');
    console.log('ejecutar', this.urlActual);

    this.accionesAprobacion.tipo_accion = tipoAccion;
    this.accionesAprobacion.tipo_solicitud = this.tipoSolicitudAprobacion;
    this.accionesAprobacion.evaluacion_capacidades = this.estudio;

    this.EstudiosPreviosService.accionSolicitudAprobacion(
      this.guidEstudio,
      this.accionesAprobacion
    ).subscribe({
      next: (response: ResponseRequest) => {
        this.isLoadingDetail = false;
        console.log('>>> isLoadingDetail = false');
        if (response.solicitud_exitosa) {
          this.snackBar.open('Información guardada correctamente', '', { duration: 3000 });
          this.getHistorialAprobacion(this.estudio_Previo_Id);
          console.log('ESTUDIO PREVIO ID----', this.estudio_Previo_Id);

          this.router.navigateByUrl(this.urlActual);
          //this.router.navigate([this.urlActual]);
        } else {
          this.snackBar.open(response.mensaje || 'La operación no fue exitosa', '', {
            duration: 3000,
          });
        }
      },
      error: () => {
        this.isLoadingDetail = false;
        this.snackBar.open('Error al procesar la solicitud', '', { duration: 3000 });
      },
    });
  }

  verPDF(guid: string): void {
    const url = `${environment.apiUrl2}/estudios-previos/${guid}/pdf_solicitud/documento`;
    window.open(url, '_blank');
    console.log('URL', url);
  }
}
