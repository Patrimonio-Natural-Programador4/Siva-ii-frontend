import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { PageHeader } from '@shared';
import { mapDynamicFieldsToFormly, mapDynamicModelToFormValues } from '@shared/utils/dynamic-form.util';
import { DynamicFormSchema } from 'src/app/models/dynamic-form';
import { ListaGenerica } from 'src/app/models/lista-generica';
import { Listados } from 'src/app/models/listados';
import { ResponseRequest } from 'src/app/models/response-request';
import { Tdr } from 'src/app/models/tdr';
import { TdrService } from 'src/app/services/tdr.service';

@Component({
  selector: 'app-acciones',
  imports: [
    PageHeader,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
  ],
  templateUrl: './acciones.html',
  styleUrl: './acciones.scss',
})
export class AccionesTdr implements OnInit {
  private readonly serviceTdr = inject(TdrService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  accion = 'Nuevo';
  isLoading = false;
  isLinear = true;
  columnas = ['posicion', 'modulo', 'descripcion', 'acciones'];

  listados: Listados[] = [];
  flujos: ListaGenerica[] = [];
  idRegistro: string = null!;
  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: null!,
    solicitud_exitosa: false,
  });

  tdrData: Tdr = {
    guid:null!,
    program_id: null!,
  };

  dynamicFormGroup = new FormGroup({});
  dynamicFormModel: Record<string, unknown> = {};
  dynamicFormSchema: DynamicFormSchema = { name: '', fields: [] };
  dynamicFormFields: FormlyFieldConfig[] = [];

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idRegistro = idParam ? idParam : null!;
    this.accion = this.idRegistro ? 'Editar' : 'Nuevo';

    this.getListados();

  }

  cargarFlujo(): void {
    const programaId = this.tdrData.program_id;
    this.flujos = this.listados[1]?.lista_generica?.filter(f => f.idrelacion === programaId) ?? [];
  }
 
  obtenerCamposTdr(): void {
    const approvalFlowId = this.tdrData.approval_flow_id;
    if (approvalFlowId) {
      this.serviceTdr.obtenerCamposTdr(approvalFlowId).subscribe({
        next: data => {
          this.dynamicFormSchema = data.form;
          this.dynamicFormModel = {};
          this.dynamicFormFields = mapDynamicFieldsToFormly(this.dynamicFormSchema.fields);
        },
        error: () => {
          this.snackBar.open('No se pudieron cargar los campos TDR', '', { duration: 3000 });
        },
      });
    }
  }

  getListados(): void {
    this.serviceTdr.getListados().subscribe({
      next: data => {
        this.listados = data;
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los listados', '', { duration: 3000 });
      },
    });
  }
  

  previsualizar(): void {
    this.tdrData.tdr_form = mapDynamicModelToFormValues(this.dynamicFormSchema.fields, this.dynamicFormModel);
    if (!this.tdrData.tdr_form || Object.keys(this.tdrData.tdr_form).length === 0) {
      this.snackBar.open('El formulario TDR es obligatorio', '', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    // this.rolData.acceso_controles = this.controles
    //   .filter(c => !!c.checked)
    //   .map(c => new AccesoControles({ id_control: c.identity }));
      console.log(this.tdrData);

      this.serviceTdr.previsualizarTdr(this.tdrData).subscribe({
        next: response => {
          this.responseRequest = response;
          this.isLoading = false;

          // if (response.solicitud_exitosa) {
          //   this.snackBar.open(esNuevo ? 'TDR creado correctamente' : 'TDR actualizado correctamente', '', {
          //     duration: 3000,
          //   });
          //   this.router.navigate(['/tdr/listar']);
          //   return;
          // }

          // this.snackBar.open(response.mensaje || 'La operación no fue exitosa', '', { duration: 3000 });
        },
        error: () => {
          // this.isLoading = false;
          // this.snackBar.open(esNuevo ? 'Error al crear el TDR' : 'Error al actualizar el TDR', '', {
          //   duration: 3000,
          // });
        },
      });
  }


  guardarTdr(): void {
    this.tdrData.tdr_form = mapDynamicModelToFormValues(this.dynamicFormSchema.fields, this.dynamicFormModel);
    if (!this.tdrData.tdr_form || Object.keys(this.tdrData.tdr_form).length === 0) {
      this.snackBar.open('El formulario TDR es obligatorio', '', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    // this.rolData.acceso_controles = this.controles
    //   .filter(c => !!c.checked)
    //   .map(c => new AccesoControles({ id_control: c.identity }));

      const esNuevo = !this.tdrData.guid || this.tdrData.guid === null!;
      const request$ = esNuevo ? this.serviceTdr.saveTdr(this.tdrData) : this.serviceTdr.updateTdr(this.tdrData);

      request$.subscribe({
        next: response => {
          this.responseRequest = response;
          this.isLoading = false;

          if (response.solicitud_exitosa) {
            this.snackBar.open(esNuevo ? 'TDR creado correctamente' : 'TDR actualizado correctamente', '', {
              duration: 3000,
            });
            this.router.navigate(['/tdr/listar']);
            return;
          }

          this.snackBar.open(response.mensaje || 'La operación no fue exitosa', '', { duration: 3000 });
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open(esNuevo ? 'Error al crear el TDR' : 'Error al actualizar el TDR', '', {
            duration: 3000,
          });
        },
      });
  }

  volver(): void {
    this.router.navigate(['/tdr/listar']);
  }
}
