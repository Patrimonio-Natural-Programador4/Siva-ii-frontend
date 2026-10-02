import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MtxDrawerRef } from '@ng-matero/extensions/drawer';

import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { TiposDocumentoAcuerdosService } from 'src/app/services/aprobacion-documentos/tipos-documento-acuerdos.service';
@Component({
  selector: 'app-evaluacion-capacidades-documento-asociado',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './evaluacion-capacidades-documento-asociado.html',
  styleUrl: './evaluacion-capacidades-documento-asociado.scss',
})
export class EvaluacionCapacidadesDocumentoAsociado implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tiposService = inject(TiposDocumentoAcuerdosService);
  private readonly service = inject(EvaluacionCapacidadesService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly drawerRef = inject(MtxDrawerRef<EvaluacionCapacidadesDocumentoAsociado>);

  @Output() documentoAgregado$ = new EventEmitter<void>();
  guidEvaluacion!: string;
  isSaving = false;
  fileName = '';
  base64File = '';

  tiposDocumento: any[] = [];
  private _documentoEditar: any = null;

  set documentoEditar(documento: any) {
    /*
    this._documentoEditar = documento;
    if (documento) {
      this.form.patchValue({
        documents_types_agreements_id: documento.documents_types_agreements_id,
        observations: documento.observations,
      });
    }*/
    this._documentoEditar = documento;
    if (documento) {
      this.form.patchValue({
        documents_types_agreements_id: documento.documents_types_agreements_id,
        observations: documento.observations,
      });
      this.bloquearTipoAdjunto();
    }
  }

  get documentoEditar(): any {
    return this._documentoEditar;
  }
  get esEdicion(): boolean {
    return !!this._documentoEditar;
  }
  ngOnInit(): void {
    this.bloquearTipoAdjunto();

    this.tiposService.getTipoDocAcuerdos().subscribe({
      next: tipos => (this.tiposDocumento = tipos),
      error: () => this.snackBar.open('Error al cargar tipos de documento', '', { duration: 3000 }),
    });
  }

  private bloquearTipoAdjunto(): void {
    if (this.esEdicion) {
      this.form.get('documents_types_agreements_id')?.disable({ emitEvent: false });
    }

    this.tiposService.getTipoDocAcuerdos().subscribe({
      next: tipos => {
        this.tiposDocumento = tipos;
      },
      error: () => {
        this.snackBar.open('Error al cargar tipos de documento', '', { duration: 3000 });
      },
    });
  }

  form: FormGroup = this.fb.group({
    documents_types_agreements_id: [null, [Validators.required]],
    observations: ['', [Validators.required, Validators.maxLength(500)]],
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

    const idDocumento: number | null = this.documentoEditar?.id ?? null;

    // El archivo solo es obligatorio al crear
    if (!idDocumento && !this.base64File) {
      this.snackBar.open('Debe seleccionar un archivo', '', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formValue = this.form.getRawValue(); // incluye el select deshabilitado

    const payload: any = {
      documents_types_agreements_id: formValue.documents_types_agreements_id,
      observations: formValue.observations,
    };

    // Solo se envía el archivo si el usuario seleccionó uno
    if (this.base64File) {
      payload.attachment_name = this.fileName;
      payload.base64_data = this.base64File;
    }

    const peticion$ = idDocumento
      ? this.service.editarDocumentoAsociado(this.guidEvaluacion, idDocumento, payload)
      : this.service.subirDocumentoAsociado(this.guidEvaluacion, payload);

    peticion$.subscribe({
      next: res => {
        this.isSaving = false;
        if (res.solicitud_exitosa) {
          this.snackBar.open(
            idDocumento ? 'Documento editado exitosamente' : 'Documento guardado exitosamente',
            '',
            { duration: 3000 }
          );
          this.documentoAgregado$.emit();
          this.drawerRef.dismiss(true);
        } else {
          this.snackBar.open(res.mensaje || 'Ocurrió un error al guardar', '', { duration: 3000 });
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
