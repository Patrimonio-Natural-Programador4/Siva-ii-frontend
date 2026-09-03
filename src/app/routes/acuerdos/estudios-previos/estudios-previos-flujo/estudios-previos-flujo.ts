import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core'; // 👈 Importado OnInit
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeader } from '@shared';
import { EstudiosPreviosService } from 'src/app/services/estudios-previos/estudios-previos.service';
import { AccionesSolicitudAprobacion } from 'src/app/models/acciones-solicitud-aprobacion';
import { SolicitudAprobacionHistorial } from 'src/app/models/solicitud-aprobacion-historial';
import {
  AccionAprobacion,
  DialogResult,
} from '@shared/components/accion-aprobacion/accion-aprobacion';

@Component({
  selector: 'app-estudios-previos-flujo',
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
  templateUrl: './estudios-previos-flujo.html',
  styleUrl: './estudios-previos-flujo.scss',
})
export class EstudiosPreviosFlujo implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly EstudiosPreviosService = inject(EstudiosPreviosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  isLoading = false;
  isLinear = false;
  isLoadingAprobacion = false;
  isSavingAprobacion = false;
  habilitarAcciones = false;

  estudioData: PreviousStudiesModel = {};

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
  tipoSolicitudAprobacion: string | undefined;

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');

    if (idParam) {
      this.cargarDetalle(+idParam);
    } else {
      console.warn('No se encontró el parámetro ID en la URL');
    }
  }

  cargarDetalle(id: number): void {
    this.isLoading = true;

    this.EstudiosPreviosService.getEstPreviosById(id).subscribe({
      next: (res: any) => {
        this.estudioData = res?.data ? res.data : res;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error cargando estudios previos:', err);
        this.snackBar.open('Error al cargar la información', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  volver(): void {
    this.router.navigate(['./estudios-previos/estudios-previos-tabla/estudios-previos-tabla']);
  }

  get hasHistorialAprobacion(): boolean {
    return this.historialAprobacion.length > 0;
  }

  get habilitarAccionesAprobacion(): boolean {
    return !!this.accionesAprobacion.id_solicitud_aprobacion;
  }

  abrirModalAccion(): void {}

  accionSolicitud() {}
}
