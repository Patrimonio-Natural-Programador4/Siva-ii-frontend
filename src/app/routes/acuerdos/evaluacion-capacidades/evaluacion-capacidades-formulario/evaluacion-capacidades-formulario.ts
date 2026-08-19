import { Component, inject, OnInit } from '@angular/core';
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
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  accion = 'Nuevo';
  idEvaCapacidades: number | null = null;
  isLoading = false;
  programs: Programs[] = [];
  pids: PidModel[] = [];
  implementers: ImplementerModel[] = [];
  persons: PersonModel[] = [];
  states: CapacityAssessmentStateModel[] = [];
  modalities: ModalidadModel[] = [];

  evaCapacidadesData: EvaluacionCapacidadesModel = new EvaluacionCapacidadesModel({
    name: '',
    observation: '',
    approximate_value: 0,
    //create_date: '',
    policy_approval_date: '',
    document_signature_date: '',
    start_date: '',
    end_date: '',
    code: '',
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
    capacity_assessments_states_id: 0,
    modalitie: '',
    modality_id: 0,
  });

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: undefined,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idEvaCapacidades = idParam ? Number(idParam) : null;
    this.accion = this.idEvaCapacidades ? 'Editar' : 'Nuevo';
    this.listarProgramas();
    this.listarPids();
    this.listarImplementers();
    this.listarPersons();
    this.listarStates();
    this.listarModalities();

    if (this.idEvaCapacidades) {
      this.EvaluacionCapacidadesService.getEvaCapacidadesById(this.idEvaCapacidades).subscribe({
        next: data => {
          this.evaCapacidadesData = new EvaluacionCapacidadesModel(data);
        },
        error: () => {
          this.snackBar.open('Error al cargar el evaluación de capacidades', '', {
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

    const request$ = this.idEvaCapacidades
      ? this.EvaluacionCapacidadesService.updateEvaCapacidades(this.evaCapacidadesData)
      : this.EvaluacionCapacidadesService.saveEvaCapacidades(this.evaCapacidadesData);

    request$.subscribe({
      next: response => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje ?? 'Operación exitosa', '', { duration: 3000 });
          this.router.navigate(['/acuerdos/evaluacion-capacidades']);
        } else {
          this.snackBar.open(response.mensaje ?? 'Error al guardar', '', { duration: 4000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al guardar el evaluación de capacidades', '', { duration: 4000 });
      },
    });
    console.log(this.evaCapacidadesData);
  }

  volver(): void {
    this.router.navigate(['/acuerdos/evaluacion-capacidades']);
  }
  listarProgramas() {
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

  listarPids() {
    this.PidsService.getPids().subscribe({
      next: r => {
        this.pids = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

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

  listarModalities() {
    this.ModalitiesService.getModalities().subscribe({
      next: r => {
        this.modalities = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }
}
