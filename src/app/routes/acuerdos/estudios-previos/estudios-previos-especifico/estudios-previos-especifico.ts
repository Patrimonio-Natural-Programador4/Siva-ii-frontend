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
import { FormsModule } from '@angular/forms';
import { ImplementersService } from 'src/app/services/implementers/implementers.service';
import { PersonsService } from 'src/app/services/personas.service';
import { CapacityAssessmentStateService } from 'src/app/services/CapacityAssessmentsStates.service';
import { CapacityAssessmentStateModel } from 'src/app/models/estado-evaluacion-capacidades';
import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { ImplementerModel } from 'src/app/models/implementers';
import { PersonModel } from 'src/app/models/personas';
import { Programs } from 'src/app/models/programs';
import { EstudiosPreviosService } from 'src/app/services/estudios-previos/estudios-previos.service';
import { ProgramsService } from 'src/app/services/programs.service';
import { environment } from '@env/environment';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-estudios-previos-especifico',
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
    FormsModule,
    MatTooltipModule,
  ],
  templateUrl: './estudios-previos-especifico.html',
  styleUrl: './estudios-previos-especifico.scss',
})
export class EstudiosPreviosEspecifico implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(EvaluacionCapacidadesService);
  private readonly EstudiosPreviosService = inject(EstudiosPreviosService);
  private readonly ImplementersService = inject(ImplementersService);
  private readonly PersonsService = inject(PersonsService);
  private readonly CapacityAssessmentStateService = inject(CapacityAssessmentStateService);
  private readonly EvaluacionCapacidadesService = inject(EvaluacionCapacidadesService);
  private readonly ProgramsService = inject(ProgramsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly tipoSolicitudAprobacion = 'APP_EC';
  private readonly urlActual = this.router.url;

  // Formulario
  accion = 'Nuevo';
  idEstPrevios: number | null = null;
  implementers: ImplementerModel[] = [];
  persons: PersonModel[] = [];
  states: CapacityAssessmentStateModel[] = [];
  capacity: EvaluacionCapacidadesModel[] = [];
  programs: Programs[] = [];

  estuPreviosData: PreviousStudiesModel = new PreviousStudiesModel({
    id: 0,
    precedents: '',
    justification: '',
    scope: '',
    overall_objective: '',
    term: '',
    obligations: '',
    supervisor: '',
    // user_session: 0,
    // create_date: '',
    total_value: 0,
    contributions_ei: 0,
    total_value_executes_fpn: 0,
    total_value_executes_ei: 0,
    capacity_assessments_states_id: 0,
    implementer_id: 0,
    persons_id: 0,
    capacity_assessment_id: 0,
    contributions_fpn: 0,
    estimated_term: '',
    program_id: 0,
  });
  /************************************************ */

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

  /***************************formulario*********************/
  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: undefined,
    solicitud_exitosa: false,
  });

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

    /***************************formulario*********************/

    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idEstPrevios = idParam ? Number(idParam) : null;
    this.accion = this.idEstPrevios ? 'Editar' : 'Nuevo';
    this.listarImplementers();
    this.listarPersons();
    this.listarStates();
    this.listarCapacity();
    this.listarPrograms();

    if (this.idEstPrevios) {
      this.EstudiosPreviosService.getEstPreviosById(this.idEstPrevios).subscribe({
        next: data => {
          this.estuPreviosData = new PreviousStudiesModel(data);
          console.log('data_estudios_previos', this.estuPreviosData);
        },
        error: () => {
          this.snackBar.open('Error al cargar el estudios previos', '', {
            duration: 3000,
          });
        },
      });
    }
  }

  volver(): void {
    this.router.navigate(['/acuerdos/evaluacion-capacidades']);
  }
  get hasHistorialAprobacion(): boolean {
    return this.historialAprobacion.length > 0;
  }

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
    console.log('ejecutar', this.urlActual);
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
          this.router.navigateByUrl(this.urlActual);
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

  /***************************formulario*********************/

  listarImplementers() {
    this.ImplementersService.getImplementers().subscribe({
      next: r => {
        this.implementers = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  listarPersons() {
    this.PersonsService.getPersons().subscribe({
      next: r => {
        this.persons = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  listarStates() {
    this.CapacityAssessmentStateService.getCapStates().subscribe({
      next: r => {
        this.states = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  listarCapacity() {
    this.EvaluacionCapacidadesService.getEvaCapacidades().subscribe({
      next: r => {
        this.capacity = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  listarPrograms() {
    this.ProgramsService.getPrograms().subscribe({
      next: r => {
        this.programs = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  guardarEstudiosPrevios(): void {
    console.log(`Evaluacion :: ${JSON.stringify(this.evaluacion)}`);

    // Data tarida desde evaluacion de capaciddes
    const {
      id,
      name,
      observation,
      approximate_value,
      guid,
      approval_request_id,
      aproval_request,
      capacity_assessments_state,
      capacity_assessments_states_id,
      codigo,
      create_date,
      document_signature_date,
      end_date,
      implementer,
      implementer_id,
      modalitie,
      modality_id,
      person,
      persons_id,
      pid,
      pid_id,
      policy_approval_date,
      program_id,
      programa,
      start_date,
    } = this.evaluacion;

    console.log(id);
    console.log(name);
    console.log(person);
    console.log('imlemeter_id', this.estuPreviosData.implementer_id);
    console.log('person_id', this.estuPreviosData.persons_id);

    // Data que envia   desde el formulario el usuario

    const estudios_previos_data: PreviousStudiesModel = {
      capacity_assessment_id: id,
      precedents: this.estuPreviosData.precedents,
      justification: this.estuPreviosData.justification,
      scope: this.estuPreviosData.scope,
      overall_objective: this.estuPreviosData.overall_objective,
      term: this.estuPreviosData.term,
      obligations: this.estuPreviosData.obligations,
      supervisor: this.estuPreviosData.supervisor,
      total_value: this.estuPreviosData.total_value,
      contributions_ei: this.estuPreviosData.contributions_ei,
      total_value_executes_fpn: this.estuPreviosData.total_value_executes_fpn,
      total_value_executes_ei: this.estuPreviosData.total_value_executes_ei,
      contributions_fpn: this.estuPreviosData.contributions_fpn,
      estimated_term: this.estuPreviosData.estimated_term,
      persons_id: this.estuPreviosData.persons_id,
      implementer_id,
      program_id,
    };

    console.log('prueba union', estudios_previos_data);

    const request$ = this.EstudiosPreviosService.saveEstPrevios(estudios_previos_data); // Data que envia   desde el formulario el usuario

    request$.subscribe({
      next: response => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje ?? 'Operación exitosa', '', { duration: 3000 });
          this.router.navigate(['/acuerdos/estudios-previos']);
        } else {
          this.snackBar.open(response.mensaje ?? 'Error al guardar', '', { duration: 4000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al guardar el estudios previos', '', { duration: 4000 });
      },
    });
    console.log(this.estuPreviosData);
  }

  volver_form(): void {
    this.router.navigate(['/acuerdos/estudios-previos']);
  }

  verPDF(guid: string): void {
    const url = `${environment.apiUrl2}/evaluaciones-de-capacidades/${guid}/pdf_solicitud/documento`;
    window.open(url, '_blank');
    console.log('URL', url);
  }
}
