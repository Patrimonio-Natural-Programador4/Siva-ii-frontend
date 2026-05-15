import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '@shared';

import { DelegacionRolesUsuarios, UsuarioDelegado } from 'src/app/models/delegacion-roles-usuarios';
import { ListaGenerica } from 'src/app/models/lista-generica';
import { Listados } from 'src/app/models/listados';
import { ResponseRequest } from 'src/app/models/response-request';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';

@Component({
  selector: 'app-flujos-aprobacion-delegacion-acciones',
  templateUrl: './delegacion-acciones.html',
  styleUrl: './delegacion-acciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatTableModule],
})
export class AccionesDelegacionAprobacion implements OnInit {
  private readonly service = inject(FlujosAprobacionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  accion = 'Nuevo';
  idDelegacion: number | null = null;
  isLoading = false;
  columnas = ['posicion', 'usuario', 'acciones'];
  listados: Listados[] = [];
  usuariosFiltro: ListaGenerica[] = [];
  usuariosList: ListaGenerica[] = [];
  idUsuarioDelegado: number | null = null;

  responseRequest = new ResponseRequest({
    mensaje: '',
    identity: null!,
    solicitud_exitosa: false,
  });

  delegacionData = new DelegacionRolesUsuarios({
    id_rol_aprobacion: null!,
    id_usuario: null!,
    ids_usuarios_delegados: [],
    usuarios_delegados: [],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idDelegacion = idParam ? Number(idParam) : null;
    this.accion = this.idDelegacion ? 'Editar' : 'Nuevo';
    this.cargarListados();
  }

  cargarListados(): void {
    this.service.getListadosDelegacion(this.idDelegacion ?? 0).subscribe({
      next: data => {
        this.listados = data;
        this.usuariosList = [...(this.listados[0]?.lista_generica ?? [])];

        if (this.idDelegacion) {
          this.cargarDelegacion();
        }
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los listados de delegación', '', { duration: 3000 });
      },
    });
  }

  cargarDelegacion(): void {
    if (!this.idDelegacion) {
      return;
    }

    this.service.getDelegacionById(this.idDelegacion).subscribe({
      next: data => {
        this.delegacionData = new DelegacionRolesUsuarios(data);
        this.delegacionData.ids_usuarios_delegados = this.delegacionData.ids_usuarios_delegados ?? [];
        this.delegacionData.usuarios_delegados = this.delegacionData.usuarios_delegados ?? [];
        this.filtrarUsuarios();
        this.actualizarUsuariosDelegables();
      },
      error: () => {
        this.snackBar.open('Error al cargar la delegación', '', { duration: 3000 });
      },
    });
  }

  filtrarUsuarios(): void {
    this.delegacionData.id_usuario = null!;
    const usuariosPorRol = this.listados[2]?.lista_generica ?? [];
    this.usuariosFiltro = usuariosPorRol.filter(item => item.idrelacion === this.delegacionData.id_rol_aprobacion);
    this.actualizarUsuariosDelegables();
  }

  actualizarUsuariosDelegables(): void {
    const idsDelegados = new Set(this.delegacionData.ids_usuarios_delegados ?? []);
    this.usuariosList = (this.listados[0]?.lista_generica ?? []).filter(item => !idsDelegados.has(Number(item.identity)));
  }

  asignarUsuario(): void {
    if (!this.idUsuarioDelegado) {
      return;
    }

    const usuario = this.usuariosList.find(item => item.identity === this.idUsuarioDelegado);
    if (!usuario) {
      return;
    }

    this.delegacionData.usuarios_delegados = [
      ...(this.delegacionData.usuarios_delegados ?? []),
      new UsuarioDelegado({ id_usuario: usuario.identity, nombre: usuario.valor }),
    ];
    this.delegacionData.ids_usuarios_delegados = [...(this.delegacionData.ids_usuarios_delegados ?? []), Number(usuario.identity)];
    this.idUsuarioDelegado = null;
    this.actualizarUsuariosDelegables();
  }

  eliminarUsuario(idUsuario: number | undefined): void {
    if (!idUsuario) {
      return;
    }

    this.delegacionData.usuarios_delegados = (this.delegacionData.usuarios_delegados ?? []).filter(item => item.id_usuario !== idUsuario);
    this.delegacionData.ids_usuarios_delegados = (this.delegacionData.ids_usuarios_delegados ?? []).filter(item => item !== idUsuario);
    this.actualizarUsuariosDelegables();
  }

  guardarDelegacion(): void {
    if (!this.delegacionData.id_rol_aprobacion || !this.delegacionData.id_usuario) {
      this.snackBar.open('Debe seleccionar el rol y el usuario de aprobación', '', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const esNuevo = !this.delegacionData.id_delegacion_roles_usuarios || this.delegacionData.id_delegacion_roles_usuarios === 0;
    const request$ = esNuevo ? this.service.saveDelegacion(this.delegacionData) : this.service.updateDelegacion(this.delegacionData);

    request$.subscribe({
      next: response => {
        this.responseRequest = response;
        this.isLoading = false;

        if (response.solicitud_exitosa) {
          this.snackBar.open(esNuevo ? 'Delegación creada correctamente' : 'Delegación actualizada correctamente', '', {
            duration: 3000,
          });
          this.router.navigate(['/flujos-aprobacion/delegacion']);
          return;
        }

        this.snackBar.open(response.mensaje || 'La operación no fue exitosa', '', { duration: 3000 });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open(esNuevo ? 'Error al crear la delegación' : 'Error al actualizar la delegación', '', {
          duration: 3000,
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/flujos-aprobacion/delegacion']);
  }
}