import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RisksModel } from 'src/app/models/risks';
import { RisksService } from 'src/app/services/risks.service';

export interface RiesgoFormularioData {
  estudioPrevioId: number;
  riesgo?: RisksModel;
}
@Component({
  selector: 'app-estudios-previos-riesgos-formulario',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule],
  templateUrl: './estudios-previos-riesgos-formulario.html',
  styleUrl: './estudios-previos-riesgos-formulario.scss',
})
export class EstudiosPreviosRiesgosFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<MatDialogRef<EstudiosPreviosRiesgosFormulario>>(MatDialogRef);
  private readonly risksService = inject(RisksService);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<RiesgoFormularioData>(MAT_DIALOG_DATA);

  esEdicion = false;
  isSaving = false;

  form = this.fb.group({
    risk: ['', Validators.required],
    mitigation: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.data?.riesgo) {
      this.esEdicion = true;
      this.form.patchValue({
        risk: this.data.riesgo.risk ?? '',
        mitigation: this.data.riesgo.mitigation ?? '',
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const riesgo: RisksModel = {
      id: this.data.riesgo?.id,
      risk: this.form.value.risk ?? '',
      mitigation: this.form.value.mitigation ?? '',
      previous_studies_id: this.data.estudioPrevioId,
    };

    const request$ = this.esEdicion
      ? this.risksService.update_risk(riesgo)
      : this.risksService.save_risk(riesgo);

    request$.subscribe({
      next: response => {
        this.isSaving = false;
        if (response.solicitud_exitosa) {
          this.dialogRef.close(true);
        } else {
          this.snackBar.open(response.mensaje ?? 'No se pudo guardar el riesgo', '', {
            duration: 4000,
          });
        }
      },
      error: err => {
        this.isSaving = false;
        // El backend responde 400/404 con el mensaje en el body
        this.snackBar.open(err?.error?.mensaje ?? 'Error al guardar el riesgo', '', {
          duration: 4000,
        });
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
