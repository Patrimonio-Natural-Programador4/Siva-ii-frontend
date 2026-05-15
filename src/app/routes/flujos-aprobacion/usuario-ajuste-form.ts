import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

interface UsuarioAjusteDisponible {
  id_rol_aprobacion_ajuste?: number;
  usuario?: string;
  id_usuario_ajuste?: number;
}

interface UsuarioAjusteDialogData {
  usuariosDisponibles?: UsuarioAjusteDisponible[];
}

@Component({
  selector: 'app-usuario-ajuste-form',
  templateUrl: './usuario-ajuste-form.html',
  styleUrl: './usuario-ajuste-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatDialogModule],
})
export class UsuarioAjusteForm {
  private readonly dialogRef = inject(MatDialogRef<UsuarioAjusteForm>);
  readonly data = inject<UsuarioAjusteDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  idRolAprobacion: number | null = null;

  solicitarAjuste(): void {
    const usuario = (this.data.usuariosDisponibles ?? []).find(item => item.id_rol_aprobacion_ajuste === this.idRolAprobacion);
    this.dialogRef.close({
      id_rol_aprobacion_ajuste: this.idRolAprobacion,
      id_usuario_ajuste: usuario?.id_usuario_ajuste ?? null,
    });
  }
}