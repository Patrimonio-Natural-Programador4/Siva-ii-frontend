import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MtxDrawer } from '@ng-matero/extensions/drawer';
import { PageHeader } from '@shared';
import {
  AccionAprobacion,
  DialogResult,
} from '@shared/components/accion-aprobacion/accion-aprobacion';
import { AccionesSolicitudAprobacion } from 'src/app/models/acciones-solicitud-aprobacion';
import { ResponseRequest } from 'src/app/models/response-request';
import { SolicitudAprobacionHistorial } from 'src/app/models/solicitud-aprobacion-historial';
import { TravelLegalization } from 'src/app/models/travel-legalization';
import { Viajes } from 'src/app/models/viajes';
import { ViajesService } from 'src/app/services/viajes.service';
import { environment } from '@env/environment';
import { LegalizacionForm } from './legalizacion-form';

@Component({
  selector: 'app-legalizacion',
  standalone: true,
  imports: [
    PageHeader,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './legalizacion.html',
  styleUrl: './legalizacion.scss',
})
export class Legalizacion implements OnInit {
  private readonly tipoSolicitudAprobacion = 'SOL_VIA_ANT';
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(ViajesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly drawer = inject(MtxDrawer);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = false;
  isLoadingAprobacion = false;
  isLoadingLegalizaciones = false;
  isSavingAprobacion = false;
  isLinear = false;
  guidViaje = '';
  comentariosAprobacion = '';
  habilitarAcciones = false;

  viajeData: Viajes = {
    itinerario: [],
    hotel: [],
  };

  displayedColumnsItinerario: string[] = [
    'origen',
    'fecha',
    'destino',
    'requiere_tiquetes',
    'zona_rural',
    'observaciones',
  ];
  displayedColumnsHotel: string[] = ['ciudad', 'fecha_llegada', 'fecha_salida', 'observaciones'];
  displayedColumnsLegalizacion: string[] = [
    'check_date',
    'check_number',
    'beneficiary',
    'nit_beneficiary',
    'regimen_name',
    'subtotal',
    'iva',
    'retention_porcentage',
    'retention',
    'amount_paid',
    'observations',
    'acciones',
  ];
  displayedColumnsAprobacion: string[] = [
    'rol',
    'usuario',
    'fecha_requerimiento',
    'fecha_aprobacion',
    'estado',
    'observaciones',
  ];

  dataSourceLegalizaciones = new MatTableDataSource<TravelLegalization>([]);
  historialAprobacion: SolicitudAprobacionHistorial[] = [];
  accionesAprobacion: AccionesSolicitudAprobacion = {};

  public responseRequest: ResponseRequest = {
    mensaje: '',
    identity: null!,
    solicitud_exitosa: false,
  };

  ngOnInit(): void {
    this.guidViaje = this.activatedRoute.snapshot.params['id'];

    if (!this.guidViaje) {
      this.snackBar.open('No se recibió identificador del viaje', '', { duration: 3000 });
      this.volver();
      return;
    }

    this.getViaje();
  }

  get hasItinerario(): boolean {
    return (this.viajeData.itinerario?.length ?? 0) > 0;
  }

  get hasHotel(): boolean {
    return (this.viajeData.hotel?.length ?? 0) > 0;
  }

  get hasHistorialAprobacion(): boolean {
    return this.historialAprobacion.length > 0;
  }

  get hasLegalizaciones(): boolean {
    return this.dataSourceLegalizaciones.data.length > 0;
  }

  get totalSubtotalLegalizaciones(): number {
    return this.sumarLegalizaciones('subtotal');
  }

  get totalIvaLegalizaciones(): number {
    return this.sumarLegalizaciones('iva');
  }

  get totalRetencionLegalizaciones(): number {
    return this.sumarLegalizaciones('retention');
  }

  get totalValorCanceladoLegalizaciones(): number {
    return this.sumarLegalizaciones('amount_paid');
  }

  volver(): void {
    this.router.navigate(['/viajes/listar']);
  }

  mostrarSiNo(valor: boolean | undefined): string {
    return valor ? 'Sí' : 'No';
  }

  verPDF(guid: string): void {
    const url = `${environment.apiUrl2}/viajes/${guid}/pdf_solicitud/documento`;
    window.open(url, '_blank');
  }

  verArchivoDosOMasPersonas(guid: string): void {
    const url = `${environment.apiUrl2}/viajes/${guid}/archivo_dos_o_mas_personas`;
    window.open(url, '_blank');
  }

  // --- GESTIÓN DE LEGALIZACIÓN Y FACTURAS (STEP 4) ---

  private sumarLegalizaciones(campo: keyof TravelLegalization): number {
    return this.dataSourceLegalizaciones.data.reduce((total, item) => {
      const valor = Number(item[campo] ?? 0);
      return total + (Number.isFinite(valor) ? valor : 0);
    }, 0);
  }

  cargarLegalizaciones(): void {
    if (!this.viajeData.id_viaje) return;
    this.isLoadingLegalizaciones = true;
    this.service.getLegalizacionByTravelId(this.viajeData.id_viaje).subscribe({
      next: (legs: TravelLegalization[]) => {
        this.isLoadingLegalizaciones = false;
        const lista = Array.isArray(legs) ? legs : legs ? [legs] : [];
        this.dataSourceLegalizaciones = new MatTableDataSource<TravelLegalization>(lista);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingLegalizaciones = false;
        this.dataSourceLegalizaciones = new MatTableDataSource<TravelLegalization>([]);
        this.cdr.markForCheck();
      },
    });
  }

  agregarLegalizacion(): void {
    if (!this.viajeData?.id_viaje) return;
    const drawerRef = this.drawer.open(LegalizacionForm, {
      position: 'right',
      width: '45%',
    });
    drawerRef.instance.travelRequestId = this.viajeData.id_viaje;
    drawerRef.instance.legalizacionChanged$.subscribe(() => {
      this.cargarLegalizaciones();
    });
    drawerRef.afterDismissed().subscribe(res => {
      if (res) {
        this.cargarLegalizaciones();
      }
    });
  }

  editarLegalizacion(leg: TravelLegalization): void {
    if (!this.viajeData?.id_viaje || !leg.legalization_id) return;
    const drawerRef = this.drawer.open(LegalizacionForm, {
      position: 'right',
      width: '45%',
    });
    drawerRef.instance.inicializarEdicion(leg, this.viajeData.id_viaje);
    drawerRef.instance.legalizacionChanged$.subscribe(() => {
      this.cargarLegalizaciones();
    });
    drawerRef.afterDismissed().subscribe(res => {
      if (res) {
        this.cargarLegalizaciones();
      }
    });
  }

  // --- GESTIÓN DE APROBACIÓN (STEP 5) ---

  abrirModalAccion(tipoAccion: 'APROBAR' | 'AJUSTAR'): void {
    const titulo = tipoAccion === 'APROBAR' ? 'Aprobar solicitud' : 'Solicitar ajustes';
    const dialogRef = this.dialog.open(AccionAprobacion, {
      width: '520px',
      disableClose: true,
      data: {
        titulo,
        tipoAccion,
        comentarios: this.accionesAprobacion.comentarios || '',
      },
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
      this.accionSolicitud(result.tipoAccion);
    });
  }

  accionSolicitud(tipo_accion: string): void {
    this.accionesAprobacion.tipo_accion = tipo_accion;
    this.accionesAprobacion.tipo_solicitud = this.tipoSolicitudAprobacion;
    this.isLoading = true;
    this.accionesAprobacion.viaje = this.viajeData;

    const request$ = this.service.accionSolicitudAprobacion(
      this.guidViaje,
      this.accionesAprobacion
    );

    request$.subscribe({
      next: response => {
        this.responseRequest = response;
        if (this.responseRequest.solicitud_exitosa) {
          this.snackBar.open('Información guardada correctamente', '', { duration: 3000 });
          this.router.navigate(['/viajes/listar']);
        } else {
          this.snackBar.open('La operación no fue exitosa', '', { duration: 3000 });
        }
      },
      error: () => {
        this.isLoading = false;
        const mensajeError =
          'Error al procesar la solicitud. Por favor, inténtelo de nuevo más tarde.';
        this.snackBar.open(mensajeError, '', { duration: 3000 });
      },
    });
  }

  private getViaje(): void {
    this.isLoading = true;
    this.service.getViajeById(this.guidViaje).subscribe({
      next: data => {
        this.viajeData = data;
        if (this.viajeData.id_viaje) {
          this.getHistorialAprobacion(this.viajeData.id_viaje);
          this.cargarLegalizaciones();
        }
        this.getValidacionAccionesAprobacion();
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar el viaje', '', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  private getHistorialAprobacion(idRegistro: number): void {
    this.isLoadingAprobacion = true;
    this.service.getHistorialAprobacion(idRegistro, this.tipoSolicitudAprobacion).subscribe({
      next: data => {
        this.historialAprobacion = data ?? [];
        this.isLoadingAprobacion = false;
      },
      error: () => {
        this.historialAprobacion = [];
        this.isLoadingAprobacion = false;
      },
    });
  }

  private getValidacionAccionesAprobacion(): void {
    this.service
      .getValidacionAccionesAprobacion(this.guidViaje, this.tipoSolicitudAprobacion)
      .subscribe({
        next: response => {
          if (!response.solicitud_exitosa || !response.mensaje) {
            this.accionesAprobacion = {};
            this.habilitarAcciones = false;
            return;
          }

          this.habilitarAcciones = response.solicitud_exitosa;
          const acciones = (
            typeof response.mensaje === 'string' ? JSON.parse(response.mensaje) : response.mensaje
          ) as AccionesSolicitudAprobacion;

          this.accionesAprobacion = {
            ...acciones,
            id_solicitud_aprobacion: this.viajeData.id_solicitud_aprobacion,
          };
        },
        error: () => {
          this.accionesAprobacion = {};
          this.habilitarAcciones = false;
        },
      });
  }
}
