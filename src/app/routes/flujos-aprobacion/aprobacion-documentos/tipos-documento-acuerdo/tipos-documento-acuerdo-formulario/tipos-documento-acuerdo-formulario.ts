import { UpperCasePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Router, ActivatedRoute } from '@angular/router';

import { PageHeader } from '@shared';
import { Listados } from 'src/app/models/listados';
import { ResponseRequest } from 'src/app/models/response-request';
import { TipoDocumentoAcuerdoModel } from 'src/app/models/tipos-documento-acuerdos';
import { TiposDocumentoAcuerdosService } from 'src/app/services/aprobacion-documentos/tipos-documento-acuerdos.service';
import { AprobacionDocumentosService } from 'src/app/services/aprobacion-documentos/aprobacion-documentos.service';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';
import { AprobacionDocumentos } from 'src/app/models/aprobacion-documentos';

@Component({
  selector: 'tipos-documento-acuerdo-formulario',
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
    MatInputModule,
    MatDialogModule,
    FormsModule,
    MatTableModule,
  ],
  templateUrl: './tipos-documento-acuerdo-formulario.html',
  styleUrl: './tipos-documento-acuerdo-formulario.scss',
})
export class TiposDocumentoAcuerdoFormulario implements OnInit {
  private readonly TiposDocumentoAcuerdosService = inject(TiposDocumentoAcuerdosService);
  private readonly AprobacionDocumentosService = inject(AprobacionDocumentosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialogRef = inject(MatDialogRef<TiposDocumentoAcuerdoFormulario>, {
    optional: true,
  });

  accion = 'Nuevo';
  id: number | null | undefined = null;
  isLoading = false;
  isLinear = true;
  listados: Listados[] = [];
  categoriasList: any[] = [];
  programasList: any[] = [];
  documentsApprovalList: any[] = [];
  documents: AprobacionDocumentos[] = [];

  typedocagreData: TipoDocumentoAcuerdoModel = new TipoDocumentoAcuerdoModel({
    is_required: true,
    description: '',
    number: 0,
    code: '',
    template: '',
    template_path: '',
    is_active: true,
    documents_approval_id: 0,
    documents_approval: '',
  });

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: undefined,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.id = idParam ? Number(idParam) : null;
    this.accion = this.id ? 'Editar' : 'Nuevo';
    this.listarTipoDocAcu();
  }

  volver(): void {
    this.router.navigate(['/flujos-aprobacion/aprobacion-documentos']);
  }

  guardarDocumento(): void {
    this.isLoading = true;

    this.TiposDocumentoAcuerdosService.saveTipoDocAcuerdos(this.typedocagreData).subscribe({
      next: response => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje ?? 'Operación exitosa', '', { duration: 3000 });
          this.TiposDocumentoAcuerdosService.refrescarTabla$.next();
          if (this.dialogRef) {
            this.dialogRef.close(true);
          }
        } else {
          this.snackBar.open(response.mensaje ?? 'Error al guardar', '', { duration: 4000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al guardar el documento de aprobación', '', { duration: 4000 });
      },
    });
  }

  listarTipoDocAcu() {
    this.AprobacionDocumentosService.getAprobDoc().subscribe({
      next: r => {
        this.documents = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  // MODAL
  listarTidocs() {
    this.TiposDocumentoAcuerdosService.getTipoDocAcuerdos().subscribe({
      next: r => {
        this.documents = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  cerrar(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
