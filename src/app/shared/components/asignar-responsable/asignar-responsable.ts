import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  AsignacionResponsableAprobacion,
  UsuarioAsignableAprobacion,
} from 'src/app/models/asignacion-responsable-aprobacion';

export interface AsignarResponsableDialogData {
  asignaciones: AsignacionResponsableAprobacion[];
}

export interface AsignarResponsableDialogResult {
  history_id: number;
  user_id: number;
}

@Component({
  selector: 'app-asignar-responsable',
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './asignar-responsable.html',
  styleUrl: './asignar-responsable.css',
})
export class AsignarResponsable {
  historyId: number | null;
  userId: number | null = null;

  constructor(
    private readonly dialogRef: MatDialogRef<AsignarResponsable>,
    @Inject(MAT_DIALOG_DATA) readonly data: AsignarResponsableDialogData
  ) {
    this.historyId = data.asignaciones.length === 1 ? data.asignaciones[0].history_id : null;
  }

  get asignacionSeleccionada(): AsignacionResponsableAprobacion | undefined {
    return this.data.asignaciones.find(asignacion => asignacion.history_id === this.historyId);
  }

  get usuariosDisponibles(): UsuarioAsignableAprobacion[] {
    return this.asignacionSeleccionada?.users ?? [];
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    if (this.historyId === null || this.userId === null) {
      return;
    }
    const result: AsignarResponsableDialogResult = {
      history_id: this.historyId,
      user_id: this.userId,
    };
    this.dialogRef.close(result);
  }
}
