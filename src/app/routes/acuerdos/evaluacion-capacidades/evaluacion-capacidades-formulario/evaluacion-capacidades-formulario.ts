import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeader } from '@shared';

import { ResponseRequest } from 'src/app/models/response-request';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { EvaluacionCapacidadesModel } from 'src/app/models/evaluacion-capacidades';
import { Programs } from 'src/app/models/programs';
import { ProgramsService } from 'src/app/services/programs.service';
import { PidModel } from 'src/app/models/pids';
import { PidsService } from 'src/app/services/pids/pids.service';
import { ImplementerModel } from 'src/app/models/implementers';
import { ImplementersService } from 'src/app/services/implementers/implementers.service';
import { PersonModel } from 'src/app/models/personas';
import { PersonsService } from 'src/app/services/personas.service';
import { CapacityAssessmentStateModel } from 'src/app/models/estado-evaluacion-capacidades';
import { CapacityAssessmentStateService } from 'src/app/services/CapacityAssessmentsStates.service';
import { ModalidadModel } from 'src/app/models/modalidades';
import { ModalitiesService } from 'src/app/services/modalidades.service';
import { LogLevel } from '@azure/msal-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Usuarios } from 'src/app/models/usuarios';

@Component({
  selector: 'evaluacion-capacidades-formulario',
  imports: [
    PageHeader,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule,
  ],
  templateUrl: './evaluacion-capacidades-formulario.html',
  styleUrl: './evaluacion-capacidades-formulario.scss',
})
export class EvaluacionCapacidadesFormulario implements OnInit {
  private readonly EvaluacionCapacidadesService = inject(EvaluacionCapacidadesService);
  private readonly ProgramsService = inject(ProgramsService);
  private readonly PidsService = inject(PidsService);
  private readonly ImplementersService = inject(ImplementersService);
  private readonly PersonsService = inject(PersonsService);
  private readonly CapacityAssessmentStateService = inject(CapacityAssessmentStateService);
  private readonly ModalitiesService = inject(ModalitiesService);
  private readonly UsuariosService = inject(UsuariosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly auth = inject(AuthService);
  user = toSignal(this.auth.user());

  accion = 'Nuevo';
  guidEvaCapacidades: string | null = null;
  isLoading = false;
  programs: Programs[] = [];
  pids: PidModel[] = [];
  implementers: ImplementerModel[] = [];
  persons: PersonModel[] = [];
  states: CapacityAssessmentStateModel[] = [];
  modalities: ModalidadModel[] = [];
  userFound: Usuarios = {};
  programsByMtf: Programs[] = [];

  evaCapacidadesData: EvaluacionCapacidadesModel = new EvaluacionCapacidadesModel({
    name: '',
    observation: '',
    approximate_value: 0,
    policy_approval_date: '',
    document_signature_date: '',
    start_date: '',
    end_date: '',
    codigo: '',
    programa: '',
    program_id: 0,
    pid: '',
    pid_id: 0,
    implementer: '',
    implementer_id: 0,
    aproval_request: '',
    person: '',
    persons_id: 0,
    capacity_assessments_state: '',
    capacity_assessments_states_id: 1,
    modalitie: '',
    modality_id: 0,
  });

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: undefined,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    const x = this.getUserByEmail();

    this.guidEvaCapacidades = this.activatedRoute.snapshot.params['guid'] ?? null;
    this.accion = this.guidEvaCapacidades ? 'Editar' : 'Nuevo';
    //this.listarProgramas();
    this.listarPids();
    this.listarImplementers();
    this.listarPersons();
    this.listarStates();
    this.listarModalities();

    if (this.guidEvaCapacidades) {
      this.EvaluacionCapacidadesService.getPorGuid(this.guidEvaCapacidades).subscribe({
        next: data => {
          this.evaCapacidadesData = new EvaluacionCapacidadesModel(data);
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackBar.open('Error al cargar la evaluación de capacidades', '', {
            duration: 3000,
          });
        },
      });
    }
  }

  guardarEvaluacionCapacidades(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.evaCapacidadesData,
      code: this.evaCapacidadesData.codigo,
    };
    delete (payload as any).codigo;

    const request$ = this.guidEvaCapacidades
      ? this.EvaluacionCapacidadesService.updateEvaCapacidades(this.guidEvaCapacidades, payload)
      : this.EvaluacionCapacidadesService.saveEvaCapacidades(payload);

    request$.subscribe({
      next: response => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje ?? 'Operación exitosa', '', { duration: 3000 });
          this.router.navigate(['/acuerdos/evaluacion-capacidades']);
        } else {
          this.snackBar.open(response.mensaje ?? 'Error al guardar', '', { duration: 6000 });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const mensaje = err.error?.mensaje ?? 'Error al guardar la evaluación de capacidades';
        this.snackBar.open(mensaje, '', { duration: 10000 });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/acuerdos/evaluacion-capacidades']);
  }

  /*  listarProgramas() {
    this.ProgramsService.getProgramsByUser().subscribe({
      next: r => {
        this.programs = r;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }*/
  listarPids() {
    this.PidsService.getPids().subscribe({
      next: r => {
        this.pids = r;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }

  listarImplementers() {
    this.ImplementersService.getImplementers().subscribe({
      next: r => {
        this.implementers = r;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }

  listarPersons() {
    this.PersonsService.getPersons().subscribe({
      next: r => {
        this.persons = r;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }

  listarStates() {
    this.CapacityAssessmentStateService.getCapStates().subscribe({
      next: r => {
        this.states = r;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }

  listarModalities() {
    this.ModalitiesService.getModalities().subscribe({
      next: r => {
        this.modalities = r;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }

  getUserByEmail() {
    const email = this.user()?.email;
    if (!email) {
      return;
    }

    this.UsuariosService.getUserByEmail(email).subscribe({
      next: user => {
        this.userFound = user;
        this.cdr.detectChanges();
        const guid = this.userFound.guid;
        if (guid) {
          this.getProgramsByMtf(guid);
        }
      },
      error: e => console.error(e),
    });
  }

  getProgramsByMtf(msf: string) {
    this.UsuariosService.getProgramsByMsf(msf).subscribe({
      next: program => {
        this.programsByMtf = program;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }
}
