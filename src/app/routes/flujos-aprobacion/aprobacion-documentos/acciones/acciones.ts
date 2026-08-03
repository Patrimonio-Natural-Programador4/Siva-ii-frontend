import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '@shared';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AprobacionDocumentos } from 'src/app/models/aprobacion-documentos';
import { ResponseRequest } from 'src/app/models/response-request';
import { AprobacionDocumentosService } from 'src/app/services/aprobacion-documentos/aprobacion-documentos.service';
import { Listados } from 'src/app/models/listados';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';

@Component({
  selector: 'app-programs-acciones',
  templateUrl: './acciones.html',
  styleUrl: './acciones.scss',
  imports: [
    PageHeader,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class AccionesAprobacionDocumentos implements OnInit {
  private readonly AprobacionDocumentosService = inject(AprobacionDocumentosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(FlujosAprobacionService);
  private readonly cdr = inject(ChangeDetectorRef);

  accion = 'Nuevo';
  id: number | null | undefined = null;
  isLoading = false;
  listados: Listados[] = [];

  categoriasList: any[] = [];
  programasList: any[] = [];

  documentapprovalData: AprobacionDocumentos = new AprobacionDocumentos({
    approval_category_id: 0,
    program_id: 0,
    documento: '',
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

    this.getListados();
  }

  getListados(): void {
    this.service
      .getListadosFlujos()
      .pipe(
        switchMap(data => {
          this.listados = data ?? [];

          // Asignamos las listas de forma segura
          this.categoriasList = this.listados[1]?.lista_generica ?? [];
          this.programasList = this.listados[2]?.lista_generica ?? [];

          if (this.id) {
            return this.AprobacionDocumentosService.getDocById(this.id);
          }
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.documentapprovalData = Object.assign(new AprobacionDocumentos(), data);

            if (data.documento) {
              this.documentapprovalData.documento = data.documento;
            }

            console.log('Datos cargados correctamente:', this.documentapprovalData);
          }

          setTimeout(() => {
            this.cdr.markForCheck();
          }, 0);
        },
        error: () => {
          this.snackBar.open('Error al cargar la información inicial', '', { duration: 3000 });
        },
      });
  }

  guardarDocumento(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const request$ = this.id
      ? this.AprobacionDocumentosService.updateDoc(this.documentapprovalData)
      : this.AprobacionDocumentosService.saveDocument(this.documentapprovalData);

    request$.subscribe({
      next: response => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje ?? 'Operación exitosa', '', { duration: 3000 });
          this.router.navigate(['/flujos-aprobacion/aprobacion-documentos']);
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

  volver(): void {
    this.router.navigate(['/flujos-aprobacion/aprobacion-documentos']);
  }
}
