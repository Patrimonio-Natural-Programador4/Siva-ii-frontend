import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Usuarios } from 'src/app/models/usuarios';
import { UsuariosService } from 'src/app/services/usuarios.service';

export interface ValidarUsuarioModalData {
  usuario: Usuarios;
}

export interface ValidarUsuarioModalResult {
  success: boolean;
  usuario?: Usuarios;
}

interface ValidarCorreoResponse {
  existe: boolean;
  guid_msft?: string;
  displayName?: string;
}

@Component({
  selector: 'app-validar-usuario-modal',
  templateUrl: './validar-usuario-modal.html',
  styleUrl: './validar-usuario-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ValidarUsuarioModal {
  private readonly dialogRef = inject(MatDialogRef<ValidarUsuarioModal>);
  private readonly data = inject<ValidarUsuarioModalData>(MAT_DIALOG_DATA);
  private readonly usuariosService = inject(UsuariosService);

  readonly usuario: Usuarios = { ...this.data.usuario };
  readonly guidMsft = signal<string | null>(this.data.usuario.guid_msft ?? null);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly validando = signal(false);
  readonly guardando = signal(false);

  getNombreCompleto(): string {
    const names = [
      this.usuario.first_name,
      this.usuario.other_name,
      this.usuario.last_name,
      this.usuario.other_last_name,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
    return names || this.usuario.email || '-';
  }

  validarCorreo(): void {
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.validando.set(true);

    if (!this.usuario.email) {
      this.mensajeError.set('El usuario no tiene correo registrado.');
      this.validando.set(false);
      return;
    }

    this.usuariosService.validarCorreoEnGrupo(this.usuario.email).subscribe({
      next: (response: ValidarCorreoResponse) => {
        if (response.existe) {
          this.guidMsft.set(response.guid_msft ?? null);
          this.mensajeExito.set(`Usuario encontrado: ${response.displayName ?? ''}`);
        } else {
          this.mensajeError.set('El correo no está registrado en el grupo corporativo.');
          this.guidMsft.set(null);
        }
        this.validando.set(false);
      },
      error: (err: { error?: { detail?: string }; message?: string }) => {
        this.mensajeError.set(
          'Error al validar: ' + (err.error?.detail ?? err.message ?? 'Error desconocido')
        );
        this.guidMsft.set(null);
        this.validando.set(false);
      },
    });
  }

  guardar(): void {
    const guid = this.guidMsft();

    if (!guid) {
      this.mensajeError.set('Debe validar el correo primero.');
      return;
    }

    if (!this.usuario.guid) {
      this.mensajeError.set('Error: identificador del usuario no disponible.');
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set(null);

    this.usuariosService.validarUsuarioCorporativo(this.usuario.guid, { guid_msft: guid }).subscribe({
      next: () => {
        this.dialogRef.close({
          success: true,
          usuario: { ...this.usuario, guid_msft: guid },
        } satisfies ValidarUsuarioModalResult);
      },
      error: (err: { error?: { detail?: string }; message?: string }) => {
        this.mensajeError.set(
          'Error al guardar: ' + (err.error?.detail ?? err.message ?? 'Error desconocido')
        );
        this.guardando.set(false);
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close({ success: false } satisfies ValidarUsuarioModalResult);
  }
}
