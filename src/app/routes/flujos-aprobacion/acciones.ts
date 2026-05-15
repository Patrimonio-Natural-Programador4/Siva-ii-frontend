import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '@shared';

import { FlujosAprobacion } from 'src/app/models/flujos-aprobacion';
import { FlujosAprobacionRuta } from 'src/app/models/flujos-aprobacion-ruta';
import { ListaGenerica } from 'src/app/models/lista-generica';
import { Listados } from 'src/app/models/listados';
import { ResponseRequest } from 'src/app/models/response-request';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';

@Component({
  selector: 'app-flujos-aprobacion-acciones',
  templateUrl: './acciones.html',
  styleUrl: './acciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatStepperModule, MatTableModule],
})
export class AccionesFlujosAprobacion implements OnInit {
  @ViewChild('fRutas') fRutasForm!: NgForm;

  private readonly service = inject(FlujosAprobacionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  accion = 'Nuevo';
  idFlujo: number | null = null;
  isLoading = false;
  isLinear = true;
  columnas = ['posicion', 'rol', 'descripcion', 'acciones'];
  listados: Listados[] = [];
  listaRoles: ListaGenerica[] = [];
  numeroRolesAsignados: number | null = null;

  flujoRuta = new FlujosAprobacionRuta({
    id_ruta: null!,
    id_rol_aprobacion: null!,
    rol: '',
    orden: null!,
    descripcion: '',
  });

  responseRequest = new ResponseRequest({
    mensaje: '',
    identity: null!,
    solicitud_exitosa: false,
  });

  flujoData = new FlujosAprobacion({
    id_flujo_aprobacion: null!,
    nombre: '',
    descripcion: '',
    id_categoria: null!,
    rutas: [],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idFlujo = idParam ? Number(idParam) : null;
    this.accion = this.idFlujo ? 'Editar' : 'Nuevo';

    this.getListados();

    if (this.idFlujo) {
      this.service.getFlujoById(this.idFlujo).subscribe({
        next: data => {
          this.flujoData = new FlujosAprobacion(data);
          this.flujoData.rutas = this.flujoData.rutas ?? [];
          this.actualizarRolesDisponibles();
        },
        error: () => {
          this.snackBar.open('Error al cargar el flujo', '', { duration: 3000 });
        },
      });
    }
  }

  getListados(): void {
    this.service.getListadosFlujos().subscribe({
      next: data => {
        this.listados = data;
        this.actualizarRolesDisponibles();
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los listados del flujo', '', { duration: 3000 });
      },
    });
  }

  actualizarRolesDisponibles(): void {
    const roles = this.listados[0]?.lista_generica ?? [];
    const usados = new Set((this.flujoData.rutas ?? []).map(item => Number(item.id_rol_aprobacion)));
    this.listaRoles = roles.filter(item => !usados.has(Number(item.identity)));
    this.numeroRolesAsignados = (this.flujoData.rutas ?? []).length || null;
  }

  asignarRol(): void {
    if (!this.flujoRuta.id_rol_aprobacion) {
      return;
    }

    const rol = this.listaRoles.find(item => item.identity === this.flujoRuta.id_rol_aprobacion);
    if (!rol) {
      return;
    }

    const nuevaRuta = new FlujosAprobacionRuta({
      id_ruta: Date.now(),
      id_rol_aprobacion: rol.identity,
      rol: rol.valor,
      descripcion: rol.valor_referencia,
      orden: (this.flujoData.rutas ?? []).length + 1,
    });

    this.flujoData.rutas = [...(this.flujoData.rutas ?? []), nuevaRuta];
    this.flujoRuta = new FlujosAprobacionRuta({ id_ruta: null!, id_rol_aprobacion: null!, rol: '', orden: null!, descripcion: '' });
    this.fRutasForm.resetForm();
    this.actualizarRolesDisponibles();
  }

  eliminarRuta(idRuta: number | undefined): void {
    if (!idRuta) {
      return;
    }

    this.flujoData.rutas = (this.flujoData.rutas ?? [])
      .filter(item => item.id_ruta !== idRuta)
      .map((item, index) => new FlujosAprobacionRuta({ ...item, orden: index + 1 }));
    this.actualizarRolesDisponibles();
  }

  guardarFlujo(): void {
    if (!this.flujoData.nombre?.trim()) {
      this.snackBar.open('El nombre del flujo es obligatorio', '', { duration: 3000 });
      return;
    }

    if (!this.flujoData.id_categoria) {
      this.snackBar.open('La categoría es obligatoria', '', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const esNuevo = !this.flujoData.id_flujo_aprobacion || this.flujoData.id_flujo_aprobacion === 0;
    const request$ = esNuevo ? this.service.saveFlujo(this.flujoData) : this.service.updateFlujo(this.flujoData);

    request$.subscribe({
      next: response => {
        this.responseRequest = response;
        this.isLoading = false;

        if (response.solicitud_exitosa) {
          this.snackBar.open(esNuevo ? 'Flujo creado correctamente' : 'Flujo actualizado correctamente', '', {
            duration: 3000,
          });
          this.router.navigate(['/flujos-aprobacion/listar']);
          return;
        }

        this.snackBar.open(response.mensaje || 'La operación no fue exitosa', '', { duration: 3000 });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open(esNuevo ? 'Error al crear el flujo' : 'Error al actualizar el flujo', '', {
          duration: 3000,
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/flujos-aprobacion/listar']);
  }
}