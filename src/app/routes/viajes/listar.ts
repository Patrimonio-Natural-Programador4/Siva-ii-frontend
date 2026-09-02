import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  viewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { Viajes } from 'src/app/models/viajes';
import { ViajesService } from 'src/app/services/viajes.service';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Listados } from 'src/app/models/listados';
import { environment } from '@env/environment';
import { MatMenuModule } from '@angular/material/menu';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.html',
  styleUrl: './listar.scss',
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
    MatDatepickerModule,
    MatMenuModule,
  ],
})
export class ListarViajes implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);
  private readonly service = inject(ViajesService);
  private readonly authService = inject(MsalService);
  private readonly cdr = inject(ChangeDetectorRef);
  columnasViaje = [
    'posicion',
    'nombre',
    'fecha_solicitud',
    'fecha_inicio',
    'fecha_fin',
    'requiere_anticipo',
    'valor_anticipo',
    'dias_despues_finalizado',
    'estado',
    'acciones',
  ];
  readonly pageSizeOptions = [20];
  id_estado: number[] = [];
  id_programa: number | null = -1;
  viajes: Viajes[] = [];
  total = 0;
  page = 1;
  currentPage = 0;
  fechaInicio?: any = null;
  fechaFin?: any = null;
  filtrobusqueda = '';
  listados: Listados[] = [];
  guidUsr = '';

  ngOnInit(): void {
    this.getUidUsr();
    this.getViajes();
    this.getListados();
  }

  getUidUsr() {
    const account = this.authService.instance.getActiveAccount();
    this.guidUsr = account?.idTokenClaims!['oid'] || '';
  }

  filtroText(newValue: any) {
    this.filtrobusqueda = newValue;
    this.filtrarDatos(true);
  }

  getListados(): void {
    this.service.getListadosListaViajes().subscribe(
      data => {
        this.listados = data;
      },
      error => {}
    );
  }

  getViajes() {
    this.service.getViajesFiltro(1, this.id_estado, '', null, null, this.id_programa).subscribe({
      next: response => {
        this.viajes = response;
        this.total = response.length > 0 ? response[0].total_registros! : 0;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error fetching viajes:', error);
      },
    });
  }

  getRowClass(row: any) {
    if (row.pendiente_mi_aprobacion) {
      return 'pendiente';
    }
    return '';
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      // pendiente de implementación
    }
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();
    if (!paginator) {
      return index + 1;
    }

    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  crearViaje(): void {
    this.router.navigate(['/viajes/crear']);
  }

  limpiarFiltros(): void {
    this.id_estado = [];
    this.id_programa = -1;
    this.fechaInicio = null;
    this.fechaFin = null;
    this.filtrobusqueda = '';
    this.page = 1;
    this.currentPage = 0;

    const paginator = this.paginator();
    if (paginator) {
      paginator.firstPage();
    }

    this.filtrarDatos(true);
  }

  pageChange(event: any) {
    this.page = event;
    this.currentPage = event.pageIndex;
    this.filtrarDatos(false);
  }
  continuarFlujo(id: string) {
    const viaje = this.viajes.find(v => v.guid == id);
    if (
      viaje!.tipo_solicitud_aprobacion == 'SV' ||
      viaje!.id_estado == 8 ||
      viaje!.id_estado == 1
    ) {
      this.router.navigate(['/viajes/detalle', id]);
    } else if (viaje!.tipo_solicitud_aprobacion == 'LV') {
      this.router.navigate(['/viajes/legalizacion/detalle', id]);
    }
  }
  filtrarDatos(filtrar = false) {
    const fechadesde = this.fechaInicio ? this.fechaInicio.format('YYYY-MM-DD') : null;
    const fechahasta = this.fechaFin ? this.fechaFin.format('YYYY-MM-DD') : null;
    this.service
      .getViajesFiltro(
        this.currentPage + 1,
        this.id_estado,
        this.filtrobusqueda,
        fechadesde,
        fechahasta,
        this.id_programa
      )
      .subscribe({
        next: response => {
          this.viajes = response;
          this.total = response.length > 0 ? response[0].total_registros! : 0;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error fetching viajes:', error);
        },
      });
  }
  editViaje(id: string) {
    this.router.navigate(['/viajes/editar', id]);
  }

  habilitarEdicion(id: string): boolean {
    const viaje = this.viajes.find(v => v.guid == id);
    let habilitarEdicion = false;
    if (
      (viaje?.id_estado == 1 ||
        (viaje?.id_estado == 3 && viaje.guid_msft_ajuste == this.guidUsr)) &&
      viaje.guid_usr == this.guidUsr
    ) {
      habilitarEdicion = true;
    }
    return habilitarEdicion;
  }

  verPDF(guid: string): void {
    const url = `${environment.apiUrl2}/viajes/${guid}/pdf_solicitud/documento`;
    window.open(url, '_blank');
  }
}
