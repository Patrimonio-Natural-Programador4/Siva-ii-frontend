import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-documentos-asociados-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './documentos-asociados-form.html',
})
export class DocumentosAsociadosForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ViajesService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly drawerRef = inject(MtxDrawerRef<DocumentosAsociadosForm>);

  @Output() documentoAgregado$ = new EventEmitter<void>();

  guidViaje!: string;
  isSaving = false;
  fileName = '';
  base64File = '';

  tiposDocumento = [
    { id: 1, name: 'Facturas' },
    { id: 2, name: 'Documentos Relacionados' },
    { id: 2, name: 'Documentos Relacionados' },
  ];

  form: FormGroup = this.fb.group({
    document_type_id: [null, [Validators.required]],
    observaciones: ['', [Validators.required, Validators.maxLength(500)]],
  });

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('El archivo no debe pesar más de 10 MB', '', { duration: 3000 });
        return;
      }
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.base64File = base64String;
      };
      reader.readAsDataURL(file);
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.base64File) {
      this.snackBar.open('Debe seleccionar un archivo', '', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formValue = this.form.value;

    const payload = {
      nombre_original: this.fileName,
      base64_data: this.base64File,
      document_type_id: formValue.document_type_id,
      observaciones: formValue.observaciones,
    };

    this.service.subirDocumentoAsociado(this.guidViaje, payload).subscribe({
      next: res => {
        this.isSaving = false;
        if (res.solicitud_exitosa) {
          this.snackBar.open('Documento guardado exitosamente', '', { duration: 3000 });
          this.documentoAgregado$.emit();
          this.drawerRef.dismiss(true);
        } else {
          this.snackBar.open('Ocurrió un error al guardar', '', { duration: 3000 });
        }
      },
      error: () => {
        this.isSaving = false;
        this.snackBar.open('Ocurrió un error en el servidor', '', { duration: 3000 });
      },
    });
  }

  cerrar(): void {
    this.drawerRef.dismiss();
  }
}
