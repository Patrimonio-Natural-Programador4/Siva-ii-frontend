import {
  Component,
  inject,
  viewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { UpperCasePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Programs } from 'src/app/models/programs';

import { PreviousStudiesListModel, PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { EstudiosPreviosService as estpreviosser } from 'src/app/services/estudios-previos/estudios-previos.service';
import { ProgramsService } from 'src/app/services/programs.service';
import { FormsModule } from '@angular/forms';
import { CapacityAssessmentStateModel } from 'src/app/models/estado-evaluacion-capacidades';
import { CapacityAssessmentStateService } from 'src/app/services/CapacityAssessmentsStates.service';
import { environment } from '@env/environment';

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
    MatTooltipModule,
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
  private readonly snackBar = inject(MatSnackBar);
  readonly descargasEnCurso = signal(new Set<string>());
  private readonly ProgramsService = inject(ProgramsService);
  private readonly CapacityAssessmentStateService = inject(CapacityAssessmentStateService);

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

    //'cap_assessments_state',
    //'app_request',
    'implementers',
    'persons',
    'capacity_assessment',
    'contributions_fpn',
    'estimated_term',
    'programs',
    'prev_studies_state',
    'acciones',
  ];

  readonly pageSizeOptions = [20];
  readonly estPreviosTable = new MatTableDataSource<PreviousStudiesModel>([]);
  programs: Programs[] = [];
  selectedProgramId: number | null = null;
  estudiosPrevios: PreviousStudiesModel[] = [];
  estudios: PreviousStudiesListModel[] = [];
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

    this.listarProgramas();
    this.listarStates();
    this.getEstudios();
    //this.estPreviosService.refrescarTabla$.subscribe(() => this.getEstudios());
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

  getEstudios(): void {
    this.estPreviosService.getListado(this.currentPage + 1, [-1], this.filtrobusqueda).subscribe({
      next: response => {
        console.log('dataestudios', response);
        this.estudios = response;
        this.total = response.length > 0 ? response[0].total_records! : 0;
        this.cdr.detectChanges();
      },
      error: error => console.error('Error al listar estudios previos:', error),
    });
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();
    if (!paginator) {
      return index + 1;
    }
    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  getRowClass(row: PreviousStudiesListModel): string {
    return row.pending_my_approval ? 'pendiente' : '';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.estPreviosTable.filter = filterValue.trim().toLowerCase();
  }

  crearEstudiosPreviosAcuerdo(): void {
    this.router.navigate(['/acuerdos/estudios-previos/crear']);
  }

  descargarFormatoEp(estudio: PreviousStudiesListModel): void {
    const guid = estudio.guid;
    if (!guid || this.descargasEnCurso().has(guid)) {
      return;
    }
    this.descargasEnCurso.update(actuales => new Set(actuales).add(guid));
    this.estPreviosService
      .descargarFormatoEp(guid)
      .pipe(
        finalize(() => {
          this.descargasEnCurso.update(actuales => {
            const pendientes = new Set(actuales);
            pendientes.delete(guid);
            return pendientes;
          });
        })
      )
      .subscribe({
        next: respuesta => {
          if (!respuesta.body || respuesta.body.size === 0) {
            this.snackBar.open('No se recibio el formato del estudio previo.', 'Cerrar');
            return;
          }
          const disposicion = respuesta.headers.get('Content-Disposition') ?? '';
          const nombre = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposicion);
          const nombreArchivo = nombre?.[1]
            ? decodeURIComponent(nombre[1])
            : (nombre?.[2] ?? `ep_${estudio.codde || guid}.docx`);
          const url = URL.createObjectURL(respuesta.body);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = nombreArchivo;
          document.body.appendChild(enlace);
          enlace.click();
          enlace.remove();
          setTimeout(() => URL.revokeObjectURL(url), 0);
        },
        error: () => {
          this.snackBar.open('No fue posible descargar el formato del estudio previo.', 'Cerrar');
        },
      });
  }

  continuarFlujo(guid: string): void {
    console.log('GUID', guid);
    console.log('estudios', this.estudios);
    const estudio = this.estudios.find(e => e.guid === guid);
    if (!estudio) {
      console.log('estudio', estudio);
      return;
    }
    this.router.navigate(['/acuerdos/estudios-previos/detalle', guid]);
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

  editarEstudioPrevio(guid: number): void {
    console.log('Boton editar AQUIIIIII', guid);

    this.router.navigate(['/acuerdos/estudios-previos/editar', guid]);
  }
}
