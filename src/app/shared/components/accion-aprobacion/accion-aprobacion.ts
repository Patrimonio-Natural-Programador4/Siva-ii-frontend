import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioDisponibleAjuste } from 'src/app/models/acciones-solicitud-aprobacion';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  titulo: string;
  tipoAccion: 'APROBAR' | 'AJUSTAR';
  comentarios?: string;
}

export interface DialogResult {
  tipoAccion: 'APROBAR' | 'AJUSTAR';
  comentarios: string;
  id_usuario_ajuste: number | null;
  id_rol_aprobacion_ajuste: number | null;
}


@Component({
  selector: 'app-accion-aprobacion',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './accion-aprobacion.html',
  styleUrl: './accion-aprobacion.scss',
})
export class AccionAprobacion {
  comentarios: string = '';
  isLoading = false;
  id_rol_aprobacion_ajuste: number | null = null;
  id_usuario_ajuste: number | null = null;
  usuarios_disponibles: UsuarioDisponibleAjuste[] = [];


  constructor(
    private dialogRef: MatDialogRef<AccionAprobacion>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.comentarios = data.comentarios ?? '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const result: DialogResult = {
      tipoAccion: this.data.tipoAccion,
      comentarios: this.comentarios ?? '',
      id_usuario_ajuste: this.usuarios_disponibles.find(u => u.id_rol_aprobacion_ajuste == this.id_rol_aprobacion_ajuste)?.id_usuario_ajuste! ?? null,
      id_rol_aprobacion_ajuste: this.id_rol_aprobacion_ajuste ?? null,
    };
    this.dialogRef.close(result);
  }
}
