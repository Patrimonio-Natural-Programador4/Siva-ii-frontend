import { EvaluacionCapacidadesModel } from 'src/app/models/evaluacion-capacidades';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { EstudiosPreviosService } from './../../../../services/estudios-previos/estudios-previos.service';
import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ImplementersService } from 'src/app/services/implementers/implementers.service';
import { PersonsService } from 'src/app/services/personas.service';
import { CapacityAssessmentStateService } from 'src/app/services/CapacityAssessmentsStates.service';
import { CapacityAssessmentStateModel } from 'src/app/models/estado-evaluacion-capacidades';
import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { ImplementerModel } from 'src/app/models/implementers';
import { PersonModel } from 'src/app/models/personas';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeader } from '@shared';
import { ResponseRequest } from 'src/app/models/response-request';

@Component({
  selector: 'app-estudios-previos-formulario',
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
  templateUrl: './estudios-previos-formulario.html',
  styleUrl: './estudios-previos-formulario.scss',
})
export class EstudiosPreviosFormulario implements OnInit {
  private readonly EstudiosPreviosService = inject(EstudiosPreviosService);
  private readonly ImplementersService = inject(ImplementersService);
  private readonly PersonsService = inject(PersonsService);
  private readonly CapacityAssessmentStateService = inject(CapacityAssessmentStateService);
  private readonly EvaluacionCapacidadesService = inject(EvaluacionCapacidadesService);

  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  accion = 'Nuevo';
  idEstPrevios: number | null = null;
  isLoading = false;
  implementers: ImplementerModel[] = [];
  persons: PersonModel[] = [];
  states: CapacityAssessmentStateModel[] = [];
  capacity: EvaluacionCapacidadesModel[] = [];

  estuPreviosData: PreviousStudiesModel = new PreviousStudiesModel({
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
  });

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: undefined,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idEstPrevios = idParam ? Number(idParam) : null;
    this.accion = this.idEstPrevios ? 'Editar' : 'Nuevo';
    this.listarImplementers();
    this.listarPersons();
    this.listarStates();
    this.listarCapacity();

    if (this.idEstPrevios) {
      this.EstudiosPreviosService.getEstPreviosById(this.idEstPrevios).subscribe({
        next: data => {
          this.estuPreviosData = new PreviousStudiesModel(data);
        },
        error: () => {
          this.snackBar.open('Error al cargar el estudios previos', '', {
            duration: 3000,
          });
        },
      });
    }
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

  guardarEstudiosPrevios(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const request$ = this.idEstPrevios
      ? this.EstudiosPreviosService.updateEstPrevios(this.estuPreviosData)
      : this.EstudiosPreviosService.saveEstPrevios(this.estuPreviosData);

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

  volver(): void {
    this.router.navigate(['/acuerdos/estudios-previos']);
  }
}
