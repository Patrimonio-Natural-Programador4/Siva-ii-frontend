import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule, DecimalPipe, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { EvaluacionCapacidadListSP } from 'src/app/models/evaluacion-capacidades';
import { EvaluacionCapacidadesModel } from 'src/app/models/evaluacion-capacidades';
import { MatOptionModule } from '@angular/material/core';
import { CapacityAssessmentStateModel } from 'src/app/models/estado-evaluacion-capacidades';
import { MatSelectModule } from '@angular/material/select';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { CapacityAssessmentStateService } from 'src/app/services/CapacityAssessmentsStates.service';
import { ProgramsService } from 'src/app/services/programs.service';
import { Programs } from 'src/app/models/programs';

@Component({
  selector: 'app-evaluaciones-capacidad-listar',
  templateUrl: './evaluacion-capacidades-tabla.html',
  styleUrl: './evaluacion-capacidades-tabla.scss',
  imports: [
    PageHeader,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    FormsModule,
    UpperCasePipe,
    DecimalPipe,
  ],
})
export class ListarEvaluacionesCapacidad implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly service = inject(EvaluacionCapacidadesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly EvaluacionCapacidadesService = inject(EvaluacionCapacidadesService);
  private readonly CapacityAssessmentStateService = inject(CapacityAssessmentStateService);
  private readonly ProgramsService = inject(ProgramsService);
  readonly paginator = viewChild(MatPaginator);
  readonly evCapacidadesTable = new MatTableDataSource<EvaluacionCapacidadesModel>([]);
  columnas = ['posicion', 'nombre', 'codigo', 'implementador', 'acciones'];
  readonly pageSizeOptions = [20];
  evaluaciones: EvaluacionCapacidadListSP[] = [];
  total = 0;
  currentPage = 0;
  statesEvaCap: CapacityAssessmentStateModel[] = [];
  programs: Programs[] = [];
  filtrobusqueda = '';
  id_programa: number[] = [];
  id_ev: number[] = [];

  ngOnInit(): void {
    this.getEvaluaciones();
    this.listarEstados();
    this.listarProgramas();
  }
  ngAfterViewInit(): void {}
  getEvaluaciones(): void {
    this.service.getListado(this.currentPage + 1, [-1], this.filtrobusqueda).subscribe({
      next: response => {
        this.evaluaciones = response;
        this.total = response.length > 0 ? response[0].total_records! : 0;
        this.cdr.detectChanges();
      },
      error: error => console.error('Error al listar evaluaciones de capacidad:', error),
    });
  }
  filtroText(valor: string): void {
    this.filtrobusqueda = valor;
    this.currentPage = 0;
    this.getEvaluaciones();
  }
  pageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.getEvaluaciones();
  }
  getRowNumber(index: number): number {
    const paginator = this.paginator();

    if (!paginator) return index + 1;
    return paginator.pageIndex * paginator.pageSize + index + 1;
  }
  getRowClass(row: EvaluacionCapacidadListSP): string {
    return row.pending_my_approval ? 'pendiente' : '';
  }
  crear(): void {
    this.router.navigate(['acuerdos/evaluacion-capacidades/crear']);
  }

  editEvaluacion(id: string) {
    this.router.navigate(['acuerdos/evaluacion-capacidades/editar', id]);
  }

  continuarFlujo(guid: string): void {
    const evaluacion = this.evaluaciones.find(e => e.guid === guid);
    if (!evaluacion) {
      return;
    }
    this.router.navigate(['acuerdos/evaluacion-capacidades/detalle', guid]);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.evCapacidadesTable.filter = filterValue.trim().toLowerCase();
  }

  filtrarDatos(filtrar = false) {
    console.log('Me ve aqui');
    this.EvaluacionCapacidadesService.getEvaluacionCapacidadesFiltro(
      this.currentPage + 1,
      this.id_ev,
      this.filtrobusqueda,
      this.id_programa
    ).subscribe({
      next: response => {
        console.log('respuesta', response);

        this.evaluaciones = response;
        this.total = response.length > 0 ? response[0].total_registros! : 0;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error fetching evaluación de capacidades:', error);
      },
    });
  }

  listarEstados() {
    this.CapacityAssessmentStateService.getCapStates().subscribe({
      next: r => {
        this.statesEvaCap = r;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }

  listarProgramas() {
    this.ProgramsService.getPrograms().subscribe({
      next: r => {
        this.programs = r;
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }
}
