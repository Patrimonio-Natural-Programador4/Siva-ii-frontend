import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  viewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { AgreementsListSP } from 'src/app/models/agreements';
import { AgreementsService } from 'src/app/services/agreements.service';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-listado-acuerdos',
  templateUrl: './listado.html',
  styleUrl: './listado.scss',
  imports: [
    PageHeader,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    DatePipe,
    CurrencyPipe,
    NgClass,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatMenuModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListarAcuerdos implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);
  private readonly service = inject(AgreementsService);
  private readonly cdr = inject(ChangeDetectorRef);

  columnasAcuerdo = [
    'codigo_siva',
    'ano_ejecucion',
    'estado_name',
    'tipo_modalidad_implementadora',
    'pilar_name',
    'monto_apropiado',
    'monto_total_apropiado',
    'total_paa',
    'acciones',
  ];

  readonly pageSizeOptions = [20];
  pageSize = 20;
  acuerdos: AgreementsListSP[] = [];
  total = 0;
  page = 1;
  currentPage = 0;
  filtrobusqueda = '';
  expandedId: number | null = null;
  listadosFiltros: any = null;

  id_pilares: number[] = [];
  prioridades: string[] = [];
  alertas: string[] = [];
  fases: string[] = [];
  id_etapas: number[] = [];
  anios: number[] = [];
  id_modalidades: number[] = [];
  id_tipos: number[] = [];

  toggleFila(element: AgreementsListSP): void {
    this.expandedId = this.expandedId === element.id ? null : element.id;
  }

  estaExpandido(element: AgreementsListSP): boolean {
    return this.expandedId === element.id;
  }

  listaNucleos(nucleos: string): string[] {
    return nucleos.split(', ').filter(n => n.trim().length > 0);
  }

  ngOnInit(): void {
    this.getListadosFiltros();
    this.getAcuerdos();
  }

  getListadosFiltros(): void {
    this.service.getListadosFiltros().subscribe({
      next: response => {
        this.listadosFiltros = response;
        this.cdr.detectChanges();
      },
      error: error => console.error('Error fetching listados:', error),
    });
  }

  filtroText(newValue: any) {
    this.filtrobusqueda = newValue;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    this.currentPage = 0;
    this.page = 1;
    const paginator = this.paginator();
    if (paginator) {
      paginator.firstPage();
    }
    this.filtrarDatos();
  }

  getAcuerdos(): void {
    this.aplicarFiltro();
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      // Paginator initialized
    }
  }

  limpiarFiltros(): void {
    this.filtrobusqueda = '';
    this.id_pilares = [];
    this.prioridades = [];
    this.alertas = [];
    this.fases = [];
    this.id_etapas = [];
    this.anios = [];
    this.id_modalidades = [];
    this.id_tipos = [];
    this.aplicarFiltro();
  }

  pageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filtrarDatos();
  }

  filtrarDatos() {
    this.service
      .getAgreements(
        this.currentPage + 1,
        this.pageSize,
        this.filtrobusqueda,
        this.id_tipos,
        this.id_modalidades,
        this.id_pilares,
        this.anios,
        this.fases,
        this.id_etapas,
        this.prioridades,
        this.alertas
      )
      .subscribe({
        next: response => {
          this.acuerdos = response;
          this.total =
            response.length > 0
              ? (response[0].total_registros ?? response[0].total_records ?? 0)
              : 0;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error fetching agreements:', error);
        },
      });
  }

  verDetalle(id: number | null): void {
    if (id) {
      // Logic to view detail or navigate
      console.log('Ver detalle: ', id);
    }
  }
}
