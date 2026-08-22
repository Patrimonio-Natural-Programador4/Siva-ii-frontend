import {
  Component,
  inject,
  viewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { UpperCasePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Programs } from 'src/app/models/programs';

import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { EstudiosPreviosService as estpreviosser } from 'src/app/services/estudios-previos/estudios-previos.service';
import { ProgramsService } from 'src/app/services/programs.service';
import { FormsModule } from '@angular/forms';
import { CapacityAssessmentStateModel } from 'src/app/models/estado-evaluacion-capacidades';
import { CapacityAssessmentStateService } from 'src/app/services/CapacityAssessmentsStates.service';

@Component({
  selector: 'app-estudios-previos-tabla',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    FormsModule,
    PageHeader,
    UpperCasePipe,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './estudios-previos-tabla.html',
  styleUrl: './estudios-previos-tabla.scss',
})
export class EstudiosPreviosTabla implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly estPreviosService = inject(estpreviosser);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ProgramsService = inject(ProgramsService);
  private readonly CapacityAssessmentStateService = inject(CapacityAssessmentStateService);

  programs: Programs[] = [];

  selectedProgramId: number | null = null;

  readonly paginator = viewChild(MatPaginator);
  readonly displayedColumns = [
    'id',
    'precedents',
    'justification',
    'scope',
    'overall_objective',
    'term',
    'obligations',
    'supervisor',
    //'user_session',
    //'create_date',
    'total_value',
    'contributions_ei',
    'total_value_executes_fpn',
    'total_value_executes_ei',
    'cap_assessments_state',
    'app_request',
    'implementers',
    'persons',
    'capacity_assessment',
    'contributions_fpn',
    'estimated_term',
    'programs',
    'acciones',
  ];

  readonly pageSizeOptions = [20];
  readonly estPreviosTable = new MatTableDataSource<PreviousStudiesModel>([]);

  estudiosPrevios: PreviousStudiesModel[] = [];
  id_estado: number[] = [];
  id_programa: number | null = -1;
  estudios_previos: PreviousStudiesModel[] = [];
  page = 1;
  currentPage = 0;
  total = 0;
  filtrobusqueda = '';

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
    program_id: 0,
  });

  states: CapacityAssessmentStateModel[] = [];

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.estPreviosTable.filterPredicate = (p, filter) => {
      const f = normalize(filter);
      return normalize(p.justification ?? '').includes(f);
    };
    this.getEstudiosPreviosAcuerdo();

    this.listarProgramas();
    this.listarStates();

    this.estPreviosService.refrescarTabla$.subscribe(() => this.getEstudiosPreviosAcuerdo());
  }

  pageChange(event: any) {
    this.page = event;
    this.currentPage = event.pageIndex;
    this.filtrarDatos(false);
  }
  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.estPreviosTable.paginator = paginator;
    }
  }

  getEstudiosPreviosAcuerdo(): void {
    this.estPreviosService.getEstPrevios().subscribe(data => {
      this.estPreviosTable.data = data;
      console.log('estudios previos', data);
    });
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();
    if (!paginator) {
      return index + 1;
    }
    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.estPreviosTable.filter = filterValue.trim().toLowerCase();
  }

  crearEstudiosPreviosAcuerdo(): void {
    this.router.navigate(['/acuerdos/estudios-previos/crear']);
  }

  continuarFlujo(id: number) {
    this.router.navigate(['/acuerdos/estudios-previos/detalle']);
  }

  /*
   continuarFlujo(guid: string) {
    let estprevios = this.estudiosPrevios.find(v => v.guid == guid)
    if(estprevios!.tipo_solicitud_aprobacion == "SV" || estprevios!.id_estado == 8 || estprevios!.id_estado == 1){
      this.router.navigate(['/viajes/detalle', id]);
    }
    else if(estprevios!.tipo_solicitud_aprobacion == "LV"){
      this.router.navigate(['/viajes/legalizacion/detalle', id]);
    }
  }*/

  filtrarDatos(filtrar = false) {
    this.estPreviosService
      .getEstudiosPreviosFiltro(
        this.currentPage + 1,
        this.id_estado,
        this.filtrobusqueda,
        this.id_programa
      )
      .subscribe({
        next: response => {
          this.estudios_previos = response;
          this.total = response.length > 0 ? response[0].total_registros! : 0;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error fetching estudios previos:', error);
        },
      });
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
}
