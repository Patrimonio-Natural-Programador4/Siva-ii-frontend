import { Component, inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RolAsignadoAprobacion,
  RolesDisponibleAjuste,
  UsuarioDisponibleAjuste,
} from 'src/app/models/acciones-solicitud-aprobacion';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  titulo: string;
  tipoAccion: 'APROBAR' | 'AJUSTAR';
  comentarios?: string;
  roles_disponibles_asignar?: RolesDisponibleAjuste[] | '[]' | null;
  roles_asignados?: RolAsignadoAprobacion[];
}

export interface DialogResult {
  tipoAccion: 'APROBAR' | 'AJUSTAR';
  comentarios: string;
  id_usuario_ajuste: number | null;
  id_rol_aprobacion_ajuste: number | null;
  roles_asignados?: RolAsignadoAprobacion[];
}

@Component({
  selector: 'app-accion-aprobacion',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './accion-aprobacion.html',
  styleUrl: './accion-aprobacion.scss',
})
export class AccionAprobacion {
  private dialogRef = inject(MatDialogRef<AccionAprobacion>);
  public data = inject<DialogData>(MAT_DIALOG_DATA);

  comentarios = '';
  isLoading = false;
  id_rol_aprobacion_ajuste: number | null = null;
  id_usuario_ajuste: number | null = null;
  usuarios_disponibles: UsuarioDisponibleAjuste[] = [];
  rolesDisponiblesAsignar: RolesDisponibleAjuste[] = [];
  usuariosAsignados: (number | null)[] = [];

  constructor() {
    const data = this.data;
    this.comentarios = data.comentarios ?? '';
    this.rolesDisponiblesAsignar =
      data.roles_disponibles_asignar === '[]' ? [] : (data.roles_disponibles_asignar ?? []);
    this.usuariosAsignados = this.rolesDisponiblesAsignar.map(rol => {
      const userId = data.roles_asignados?.find(asignado => asignado.rol_id === rol.rol_id)
        ?.users[0]?.user_id;
      return rol.users?.some(user => user.user_id === userId) ? (userId ?? null) : null;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const result: DialogResult = {
      tipoAccion: this.data.tipoAccion,
      comentarios: this.comentarios ?? '',
      id_usuario_ajuste:
        this.usuarios_disponibles.find(
          u => u.id_rol_aprobacion_ajuste == this.id_rol_aprobacion_ajuste
        )?.id_usuario_ajuste ?? null,
      id_rol_aprobacion_ajuste: this.id_rol_aprobacion_ajuste ?? null,
    };
    if (this.data.roles_disponibles_asignar) {
      result.roles_asignados = this.rolesDisponiblesAsignar.flatMap((rol, index) => {
        const user = rol.users?.find(usuario => usuario.user_id === this.usuariosAsignados[index]);
        if (rol.rol_id == null || user?.user_id == null) {
          return [];
        }
        return [
          {
            rol: rol.rol,
            rol_id: rol.rol_id,
            users: [{ user_id: user.user_id, name: user.name }],
          },
        ];
      });
    }
    this.dialogRef.close(result);
  }
}
