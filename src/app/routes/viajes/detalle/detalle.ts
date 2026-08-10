import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '@shared';
import { AccionAprobacion, DialogResult } from '@shared/components/accion-aprobacion/accion-aprobacion';
import { AccionesSolicitudAprobacion, UsuarioDisponibleAjuste } from 'src/app/models/acciones-solicitud-aprobacion';
import { ResponseRequest } from 'src/app/models/response-request';
import { SolicitudAprobacionHistorial } from 'src/app/models/solicitud-aprobacion-historial';
import { Viajes } from 'src/app/models/viajes';
import { UsuarioAjusteForm } from 'src/app/routes/flujos-aprobacion/usuario-ajuste-form';
import { ViajesService } from 'src/app/services/viajes.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-detalle',
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
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
})
export class Detalle implements OnInit {
  private readonly tipoSolicitudAprobacion = 'SOL_VIA_ANT';
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(ViajesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  isLoading = false;
  isLoadingAprobacion = false;
  isSavingAprobacion = false;
  isLinear = false;
  guidViaje = '';
  comentariosAprobacion = '';
  habilitarAcciones: boolean = false;
  
  viajeData: Viajes = {
    itinerario: [],
    hotel: [],
    anticipo: {
      detalle: [],
    },
  };

  displayedColumnsItinerario: string[] = [
    'origen',
    'fecha',
    'destino',
    'requiere_tiquetes',
    'zona_rural',
    'observaciones'
  ];
  displayedColumnsHotel: string[] = [
    'ciudad',
    'fecha_llegada',
    'fecha_salida',
    'tipo_alojamiento',
    'gestiona',
    'observaciones'
  ];
  displayedColumnsAnticipo: string[] = [
    'concepto',
    'valor',
    'observaciones',
  ];
  displayedColumnsAprobacion: string[] = [
    'rol',
    'usuario',
    'fecha_requerimiento',
    'fecha_aprobacion',
    'estado',
    'observaciones',
  ];
  historialAprobacion: SolicitudAprobacionHistorial[] = [];
  accionesAprobacion: AccionesSolicitudAprobacion = {};

  public responseRequest: ResponseRequest = {
    mensaje: "",
    identity: null!,
    solicitud_exitosa: false
  }

  ngOnInit(): void {
    this.guidViaje = this.activatedRoute.snapshot.params['id'];

    if (!this.guidViaje) {
      this.snackBar.open('No se recibio identificador del viaje', '', { duration: 3000 });
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

  get hasAnticipo(): boolean {
    return (this.viajeData.anticipo?.detalle?.length ?? 0) > 0;
  }

  volver(): void {
    this.router.navigate(['/viajes/listar']);
  }

  editarViaje(): void {
    this.router.navigate(['/viajes/editar', this.guidViaje]);
  }

  mostrarSiNo(valor: boolean | undefined): string {
    return valor ? 'Si' : 'No';
  }

  get hasHistorialAprobacion(): boolean {
    return this.historialAprobacion.length > 0;
  }

  get habilitarAccionesAprobacion(): boolean {
    return !!this.accionesAprobacion.id_solicitud_aprobacion;
  }

  abrirModalAccion(tipoAccion: 'APROBAR' | 'AJUSTAR'): void {
    const titulo = tipoAccion === 'APROBAR' ? 'Aprobar solicitud' : 'Solicitar ajustes';
    const dialogRef = this.dialog.open(AccionAprobacion, {
      width: '520px',
      disableClose: true,
      data: {
        titulo,
        tipoAccion,
        comentarios: this.accionesAprobacion.comentarios || ''
      }
    });

    dialogRef.componentInstance.usuarios_disponibles = this.accionesAprobacion.usuarios_disponibles_ajustes || [];

    dialogRef.afterClosed().subscribe((result: DialogResult | undefined) => {
      if (!result) {
        return;
      }
      this.accionesAprobacion.comentarios = result.comentarios;
      if(tipoAccion === 'AJUSTAR') {
        this.accionesAprobacion.id_usuario_ajuste = result.id_usuario_ajuste;
        this.accionesAprobacion.id_rol_aprobacion_ajuste = result.id_rol_aprobacion_ajuste;
      }
      this.accionSolicitud(result.tipoAccion);
    });
  }

  accionSolicitud(tipo_accion: string) {
    // Validar que si habilitar_pago es true, debe haber detalles de pago
    

    this.accionesAprobacion.tipo_accion = tipo_accion;
    this.accionesAprobacion.tipo_solicitud = this.tipoSolicitudAprobacion;
    // this.viajeData.itinerario?.forEach(item => {
    //   if (item.fecha) {
    //     // (item as any).fecha = new Date(item.fecha).toISOString();
    //     // Assign formatted date to a new property
    //     (item as any).fecha = item.fecha.toISOString().split('T')[0];
    //   }
    // });
    this.isLoading = true; //  Mostrar spinner o deshabilitar botón
    this.accionesAprobacion.viaje = this.viajeData;
    // this.accionesAprobacion.id_solicitud_aprobacion = this.informe.id_solicitud_aprobacion;
    const request$ = this.service.accionSolicitudAprobacion(this.guidViaje, this.accionesAprobacion);

    request$.subscribe({
      next: (response) => {
        this.responseRequest = response;
        if (this.responseRequest.solicitud_exitosa) {
          this.snackBar.open('Información guardada correctamente', '', { duration: 3000 });
          this.router.navigate(['/viajes/listar']);
        } else {
          this.snackBar.open('La operación no fue exitosa', '', { duration: 3000 });
        }
      },
      error: () => {
        this.isLoading = false; //  Ocultar spinner si hay error
        const mensajeError = "Error al procesar la solicitud. Por favor, inténtelo de nuevo más tarde.";
        this.snackBar.open(mensajeError, '', { duration: 3000 });
      }
    });
  }

  // aprobarSolicitud(): void {
  //   this.ejecutarAccionAprobacion('APROBAR');
  // }

  // solicitarAjustes(): void {
  //   const usuarios = this.accionesAprobacion.usuarios_disponibles_ajustes ?? [];
  //   if (!usuarios.length) {
  //     this.snackBar.open('No hay usuarios disponibles para solicitar ajustes', '', { duration: 3000 });
  //     return;
  //   }

  //   if (usuarios.length === 1) {
  //     this.ejecutarAccionAprobacion('AJUSTAR', usuarios[0]);
  //     return;
  //   }

  //   const dialogRef = this.dialog.open(UsuarioAjusteForm, {
  //     width: '520px',
  //     data: { usuariosDisponibles: usuarios },
  //   });

  //   dialogRef.afterClosed().subscribe((result?: UsuarioDisponibleAjuste) => {
  //     if (!result) {
  //       return;
  //     }
  //     this.ejecutarAccionAprobacion('AJUSTAR', result);
  //   });
  // }

  private getViaje(): void {
    this.isLoading = true;
    this.service.getViajeById(this.guidViaje).subscribe(data => {
      this.viajeData = data;
      if (this.viajeData.id_viaje) {
        this.getHistorialAprobacion(this.viajeData.id_viaje);
      }
      this.getValidacionAccionesAprobacion();
      this.isLoading = false;
    }, error => {
      this.snackBar.open('Error al cargar el viaje', '', { duration: 3000 });
      this.isLoading = false;
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
    this.service.getValidacionAccionesAprobacion(this.guidViaje, this.tipoSolicitudAprobacion).subscribe({
      next: response => {
        console.log('response', response);
        if (!response.solicitud_exitosa || !response.mensaje) {
          this.accionesAprobacion = {};
          return;
        }

        this.habilitarAcciones = response.solicitud_exitosa;
        
        const acciones = JSON.parse(response.mensaje) as AccionesSolicitudAprobacion;
        if (acciones.usuario_solicito && this.habilitarAcciones) {
          this.router.navigate(['/viajes/editar', this.guidViaje]);
        }
        this.accionesAprobacion = {
          ...acciones,
          id_solicitud_aprobacion: this.viajeData.id_solicitud_aprobacion,
        };
      },
      error: () => {
        this.accionesAprobacion = {};
      },
    });
  }

  private ejecutarAccionAprobacion(tipoAccion: 'APROBAR' | 'AJUSTAR', destinoAjuste?: UsuarioDisponibleAjuste): void {
    if (!this.habilitarAccionesAprobacion) {
      return;
    }

    this.isSavingAprobacion = true;
    const payload: AccionesSolicitudAprobacion = {
      id_solicitud_aprobacion: this.accionesAprobacion.id_solicitud_aprobacion,
      comentarios: this.comentariosAprobacion?.trim() || undefined,
      tipo_accion: tipoAccion,
      tipo_solicitud: this.tipoSolicitudAprobacion,
      id_usuario_ajuste: destinoAjuste?.id_usuario_ajuste ?? null,
      id_rol_aprobacion_ajuste: destinoAjuste?.id_rol_aprobacion_ajuste ?? null,
    };

    this.service.accionSolicitudAprobacion(this.guidViaje, payload).subscribe({
      next: response => {
        this.isSavingAprobacion = false;
        if (!response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje || 'La acción no pudo completarse', '', { duration: 3000 });
          return;
        }

        this.comentariosAprobacion = '';
        this.snackBar.open(response.mensaje || 'La acción se completó correctamente', '', { duration: 3000 });
        this.getViaje();
      },
      error: () => {
        this.isSavingAprobacion = false;
        this.snackBar.open('Error al procesar la acción de aprobación', '', { duration: 3000 });
      },
    });
  }

  verPDF(guid: string): void {
    const url = `${environment.apiUrl2}/viajes/${guid}/pdf_solicitud/documento`;
    window.open(url, '_blank');
  }
}
