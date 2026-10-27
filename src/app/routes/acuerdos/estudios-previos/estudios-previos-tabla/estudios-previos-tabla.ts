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
import { FlujoPreviousStudiesListModel } from 'src/app/models/flujos-estudios-previos';
import { HistorialAprobacionEstudiosPrevios } from 'src/app/services/historial-aprobacion-estudios-previos/historial-aprobacion-estudios-previos';

interface FiltrosFlujo {
  programa: number | null;
  estado: number | null;
}

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
  private readonly FlujoEpService = inject(HistorialAprobacionEstudiosPrevios);

  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = [
    'approval_request_id',
    'rol',
    'implementadora',
    'estado_aprobacion',
    'pilar',
    'lider_pilar',
    'usuario',
    'modalidad',
    'capacity_state',
    'acciones',
  ];

  readonly pageSize = 20;
  readonly estPreviosTable = new MatTableDataSource<PreviousStudiesModel>([]);
  programs: Programs[] = [];
  estudiosPrevios: PreviousStudiesModel[] = [];
  estudios: PreviousStudiesListModel[] = [];
  id_estado: number[] = [];
  id_programa: number | null = -1;
  estudios_previos: PreviousStudiesModel[] = [];
  page = 1;
  currentPage = 0;
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

  readonly flujosTable = new MatTableDataSource<FlujoPreviousStudiesListModel>([]);

  selectedProgramId: number | null = null;
  selectedStateId: number | null = null;

  get total(): number {
    return this.flujosTable.filteredData.length;
  }

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.estPreviosTable.filterPredicate = (p, filter) => {
      const f = normalize(filter);
      return normalize(p.justification ?? '').includes(f);
    };

    //   filtroe
    this.flujosTable.filterPredicate = (fila, filtro) => {
      const { programa, estado } = JSON.parse(filtro) as FiltrosFlujo;
      const cumplePrograma = programa === null || Number(fila.id_programa) === programa;
      const cumpleEstado = estado === null || Number(fila.id_capacity_state_id) === estado;
      return cumplePrograma && cumpleEstado;
    };

    //this.getEstudios();
    this.getFlujosEstudios();
    this.listarProgramas();
    this.listarStates();

    //
    //this.estPreviosService.refrescarTabla$.subscribe(() => this.getEstudios());
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.flujosTable.paginator = paginator;
    }
  }

  //detectar cambios
  aplicarFiltros(): void {
    const filtros: FiltrosFlujo = {
      programa: this.selectedProgramId,
      estado: this.selectedStateId,
    };
    this.flujosTable.filter = JSON.stringify(filtros);
    this.flujosTable.paginator?.firstPage();
  }

  limpiarFiltros(): void {
    this.selectedProgramId = null;
    this.selectedStateId = null;
    this.aplicarFiltros();
  }

  getEstudios(): void {
    this.estPreviosService.getListado(this.currentPage + 1, [-1], this.filtrobusqueda).subscribe({
      next: response => {
        console.log('dataestudios', response);
        this.estudios = response;
        this.cdr.detectChanges();
      },
      error: error => console.error('Error al listar estudios previos:', error),
    });
  }

  getFlujosEstudios(): void {
    this.FlujoEpService.getFlujoEstudiosPrevios().subscribe({
      next: r => {
        console.log(' getFlujosEstudios ', r);

        this.flujosTable.data = r ?? [];
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: e => {
        console.error(e);
      },
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

  /*
  descargarFormatoEp(estudio: PreviousStudiesListModel): void {
    console.log("descargarFormatoEp " );
    
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
*/

  descargarFormatoEp(flujo: FlujoPreviousStudiesListModel): void {
    console.log('descargarFormatoEp ', flujo);
    const guid = flujo.guid_ev;
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
            : (nombre?.[2] ?? `ep_${flujo.codde || guid}.docx`);
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
    //console.log('GUID', guid);
    // console.log('estudios', this.estudios);
    const estudio = this.flujosTable.data.find(e => e.guid_ev === guid);
    if (!estudio) {
      console.log('estudio', estudio);
      return;
    }
    this.router.navigate(['/acuerdos/estudios-previos/detalle', guid]);
  }

  listarProgramas() {
    this.ProgramsService.getPrograms().subscribe({
      next: r => {
        this.programs = r;
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
      },
      error: e => {
        console.error(e);
      },
    });
  }

  editarEstudioPrevio(guid: number): void {
    console.log('Editar  ', guid);

    this.router.navigate(['/acuerdos/estudios-previos/editar', guid]);
  }
}
