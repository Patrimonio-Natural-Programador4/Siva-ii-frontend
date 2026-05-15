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

import { ListaGenerica } from 'src/app/models/lista-generica';
import { Listados } from 'src/app/models/listados';
import { ResponseRequest } from 'src/app/models/response-request';
import { RolesAprobacion } from 'src/app/models/roles-aprobacion';
import { RolesAprobacionUsuarios } from 'src/app/models/roles-aprobacion-usuarios';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';

@Component({
  selector: 'app-flujos-aprobacion-acciones-roles',
  templateUrl: './acciones-roles.html',
  styleUrl: './acciones-roles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatStepperModule, MatTableModule],
})
export class AccionesRolesAprobacion implements OnInit {
  @ViewChild('fUsuarios') fUsuariosForm!: NgForm;

  private readonly service = inject(FlujosAprobacionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  accion = 'Nuevo';
  idRol: number | null = null;
  isLoading = false;
  isLinear = true;
  columnas = ['posicion', 'usuario', 'acciones'];
  listados: Listados[] = [];
  listaUsuarios: ListaGenerica[] = [];
  numeroUsuariosAsignados: number | null = null;

  usuariosRol = new RolesAprobacionUsuarios({
    id_usuario: null!,
    usuario: '',
    area: '',
    correo: '',
  });

  responseRequest = new ResponseRequest({
    mensaje: '',
    identity: null!,
    solicitud_exitosa: false,
  });

  rolData = new RolesAprobacion({
    id_rol_aprobacion: null!,
    nombre: '',
    descripcion: '',
    usuarios: [],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idRol = idParam ? Number(idParam) : null;
    this.accion = this.idRol ? 'Editar' : 'Nuevo';

    this.getListados();

    if (this.idRol) {
      this.service.getRolById(this.idRol).subscribe({
        next: data => {
          this.rolData = new RolesAprobacion(data);
          this.rolData.usuarios = this.rolData.usuarios ?? [];
          this.actualizarUsuariosDisponibles();
        },
        error: () => {
          this.snackBar.open('Error al cargar el rol', '', { duration: 3000 });
        },
      });
    }
  }

  getListados(): void {
    this.service.getListadosRoles().subscribe({
      next: data => {
        this.listados = data;
        this.actualizarUsuariosDisponibles();
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los usuarios', '', { duration: 3000 });
      },
    });
  }

  actualizarUsuariosDisponibles(): void {
    const disponibles = this.listados[0]?.lista_generica ?? [];
    const asignados = new Set((this.rolData.usuarios ?? []).map(item => Number(item.id_usuario)));
    this.listaUsuarios = disponibles.filter(item => !asignados.has(Number(item.identity)));
    this.numeroUsuariosAsignados = (this.rolData.usuarios ?? []).length || null;
  }

  asignarUsuario(): void {
    if (!this.usuariosRol.id_usuario) {
      return;
    }

    const usuario = this.listaUsuarios.find(item => item.identity === this.usuariosRol.id_usuario);
    if (!usuario) {
      return;
    }

    const nuevo = new RolesAprobacionUsuarios({
      id_usuario: usuario.identity,
      usuario: usuario.valor,
      correo: usuario.valor_referencia,
      area: usuario.valor_referencia2,
    });

    this.rolData.usuarios = [...(this.rolData.usuarios ?? []), nuevo];
    this.usuariosRol = new RolesAprobacionUsuarios({ id_usuario: null!, usuario: '', area: '', correo: '' });
    this.fUsuariosForm.resetForm();
    this.actualizarUsuariosDisponibles();
  }

  eliminarUsuario(idUsuario: number | undefined): void {
    if (!idUsuario) {
      return;
    }

    this.rolData.usuarios = (this.rolData.usuarios ?? []).filter(item => item.id_usuario !== idUsuario);
    this.actualizarUsuariosDisponibles();
  }

  guardarRol(): void {
    if (!this.rolData.nombre?.trim()) {
      this.snackBar.open('El nombre del rol es obligatorio', '', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const esNuevo = !this.rolData.id_rol_aprobacion || this.rolData.id_rol_aprobacion === 0;
    const request$ = esNuevo ? this.service.saveRol(this.rolData) : this.service.updateRol(this.rolData);

    request$.subscribe({
      next: response => {
        this.responseRequest = response;
        this.isLoading = false;

        if (response.solicitud_exitosa) {
          this.snackBar.open(esNuevo ? 'Rol de aprobación creado correctamente' : 'Rol de aprobación actualizado correctamente', '', {
            duration: 3000,
          });
          this.router.navigate(['/flujos-aprobacion/roles']);
          return;
        }

        this.snackBar.open(response.mensaje || 'La operación no fue exitosa', '', { duration: 3000 });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open(esNuevo ? 'Error al crear el rol de aprobación' : 'Error al actualizar el rol de aprobación', '', {
          duration: 3000,
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/flujos-aprobacion/roles']);
  }
}