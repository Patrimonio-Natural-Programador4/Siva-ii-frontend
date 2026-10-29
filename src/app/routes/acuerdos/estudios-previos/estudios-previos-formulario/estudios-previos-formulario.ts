import { ProgramsService } from 'src/app/services/programs.service';
import { EvaluacionCapacidadesModel } from 'src/app/models/evaluacion-capacidades';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { EstudiosPreviosService } from './../../../../services/estudios-previos/estudios-previos.service';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ImplementersService } from 'src/app/services/implementers/implementers.service';
import { PersonsService } from 'src/app/services/personas.service';
import { CapacityAssessmentStateService } from 'src/app/services/CapacityAssessmentsStates.service';
import { CapacityAssessmentStateModel } from 'src/app/models/estado-evaluacion-capacidades';
import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { ImplementerModel } from 'src/app/models/implementers';
import { PersonModel } from 'src/app/models/personas';
import { Programs } from 'src/app/models/programs';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { PageHeader } from '@shared';
import { ResponseRequest } from 'src/app/models/response-request';
import { MtxDrawer } from '@ng-matero/extensions/drawer';
import {
  ActividadEstudio,
  ObjetivoEstudio,
  ProductoEstudio,
  ProductosFormData,
} from 'src/app/models/agreements-products';
import { ProductosForm } from '../productos-form/productos-form';
import { DesembolsosForm } from '../desembolsos-form/desembolsos-form';
import {
  DesembolsoEstudio,
  DesembolsoFormData,
  EstadoDesembolso,
  productosParaDesembolso,
} from 'src/app/models/desembolsos-estudio';

@Component({
  selector: 'app-estudios-previos-formulario',
  imports: [
    PageHeader,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatSnackBarModule,
    CommonModule,
  ],
  templateUrl: './estudios-previos-formulario.html',
  styleUrl: './estudios-previos-formulario.scss',
})
export class EstudiosPreviosFormulario implements OnInit {
  private readonly EstudiosPreviosService = inject(EstudiosPreviosService);
  private readonly ImplementersService = inject(ImplementersService);
  private readonly PersonsService = inject(PersonsService);
  private readonly CapacityAssessmentStateService = inject(CapacityAssessmentStateService);
  private readonly EvaluacionCapacidadesService = inject(EvaluacionCapacidadesService);
  private readonly ProgramsService = inject(ProgramsService);

  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly drawer = inject(MtxDrawer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  accion = 'Nuevo';
  idEstPrevios: number | null = null;
  guidEstudio: string | null = null;
  isLoading = false;
  cargandoEstudio = false;
  errorCarga = false;
  estadosDesembolso: EstadoDesembolso[] = [];
  cargandoEstadosDesembolso = false;
  errorEstadosDesembolso = false;
  implementers: ImplementerModel[] = [];
  persons: PersonModel[] = [];
  states: CapacityAssessmentStateModel[] = [];
  capacity: EvaluacionCapacidadesModel[] = [];
  programs: Programs[] = [];

  estuPreviosData: PreviousStudiesModel = new PreviousStudiesModel({
    precedents: '',
    justification: '',
    scope: '',
    overall_objective: '',
    term: '',
    obligations: '',
    supervisor: '',
    // user_session: 0,
    // create_date: '',
    total_value: 0,
    contributions_ei: 0,
    total_value_executes_fpn: 0,
    total_value_executes_ei: 0,
    capacity_assessments_states_id: 0,
    implementer_id: 0,
    persons_id: 0,
    capacity_assessment_id: 0,
    contributions_fpn: 0,
    estimated_term: '',
    program_id: 0,
    enviar_aprobacion: false,
    agreement_type_id: 0,
    modality_id: 0,
    objetivos: [],
    desembolsos: [],
  });

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: undefined,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    const guidParam = this.activatedRoute.snapshot.params['guid'];
    this.guidEstudio = guidParam ?? null;
    this.accion = this.guidEstudio ? 'Editar' : 'Nuevo';

    this.listarImplementers();
    this.listarPersons();
    this.listarStates();
    this.listarCapacity();
    this.listarPrograms();
    this.listarEstadosDesembolso();

    if (this.guidEstudio) {
      this.cargandoEstudio = true;
      this.EstudiosPreviosService.getPorGuid(this.guidEstudio).subscribe({
        next: data => {
          this.estuPreviosData = new PreviousStudiesModel(data);
          this.cargandoEstudio = false;
        },
        error: () => {
          this.cargandoEstudio = false;
          this.errorCarga = true;
          this.snackBar.open('Error al cargar el estudios previos', '', {
            duration: 3000,
          });
        },
      });
    }
  }

  listarImplementers() {
    this.ImplementersService.getImplementers().subscribe({
      next: r => {
        this.implementers = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  listarPersons() {
    this.PersonsService.getPersons().subscribe({
      next: r => {
        this.persons = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  listarStates() {
    this.CapacityAssessmentStateService.getCapStates().subscribe({
      next: r => {
        this.states = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  listarCapacity() {
    this.EvaluacionCapacidadesService.getEvaCapacidades().subscribe({
      next: r => {
        this.capacity = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  listarPrograms() {
    this.ProgramsService.getPrograms().subscribe({
      next: r => {
        this.programs = r;
        console.log(r);
      },
      error: e => {
        console.error(e);
      },
    });
  }

  guardarEstudiosPrevios(enviarAprobacion: boolean): void {
    if (this.isLoading || this.cargandoEstudio || this.errorCarga) {
      return;
    }

    this.isLoading = true;
    this.estuPreviosData.enviar_aprobacion = enviarAprobacion;

    const request$ = this.guidEstudio
      ? this.EstudiosPreviosService.updateEstPrevios(this.estuPreviosData)
      : this.EstudiosPreviosService.saveEstPrevios(this.estuPreviosData);

    request$.subscribe({
      next: response => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje ?? 'Operación exitosa', '', { duration: 3000 });
          this.router.navigate(['/acuerdos/estudios-previos']);
        } else {
          this.snackBar.open(response.mensaje ?? 'Error al guardar', '', { duration: 4000 });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        const mensaje =
          typeof error.error?.mensaje === 'string'
            ? error.error.mensaje
            : 'Error al guardar el estudio previo';
        this.snackBar.open(mensaje, '', { duration: 4000 });
      },
    });
    //console.log(this.estuPreviosData);
  }

  agregarObjetivo(): void {
    this.abrirProducto({ tipo: 'objetivo' }, registro => {
      const objetivos = this.estuPreviosData.objetivos ?? [];
      const siguiente =
        Math.max(
          0,
          ...objetivos.map(objetivo =>
            /^\d+$/.test(objetivo.code ?? '') ? Number(objetivo.code) : 0
          )
        ) + 1;
      this.estuPreviosData.objetivos = [
        ...objetivos,
        { ...registro, code: String(siguiente), actividades: [] },
      ];
    });
  }

  agregarActividad(objetivo: ObjetivoEstudio): void {
    this.abrirProducto(
      { tipo: 'actividad', padre: `${objetivo.code ?? ''} - ${objetivo.product ?? ''}` },
      registro => {
        objetivo.actividades = [...objetivo.actividades, { ...registro, productos: [] }];
      }
    );
  }

  editarObjetivo(objetivo: ObjetivoEstudio): void {
    this.abrirProducto({ tipo: 'objetivo', registro: objetivo }, registro => {
      objetivo.product = registro.product;
      objetivo.modificar = true;
    });
  }

  editarActividad(objetivo: ObjetivoEstudio, actividad: ActividadEstudio): void {
    this.abrirProducto(
      {
        tipo: 'actividad',
        padre: `${objetivo.code ?? ''} - ${objetivo.product ?? ''}`,
        registro: actividad,
      },
      registro => {
        actividad.code = registro.code;
        actividad.product = registro.product;
        actividad.modificar = true;
      }
    );
  }

  agregarProducto(actividad: ActividadEstudio): void {
    this.abrirProducto(
      {
        tipo: 'producto',
        padre: `${actividad.code ?? ''} - ${actividad.product ?? ''}`,
        codigosExistentes: actividad.productos.map(producto => producto.code),
      },
      registro => {
        actividad.productos = [
          ...actividad.productos,
          { ...registro, client_id: crypto.randomUUID() },
        ];
      }
    );
  }

  editarProducto(actividad: ActividadEstudio, producto: ProductoEstudio): void {
    this.abrirProducto(
      {
        tipo: 'producto',
        registro: producto,
        padre: `${actividad.code ?? ''} - ${actividad.product ?? ''}`,
        codigosExistentes: actividad.productos
          .filter(actual => actual !== producto)
          .map(actual => actual.code),
      },
      registro => {
        Object.assign(producto, {
          code: registro.code,
          product: registro.product,
          unit_measure: registro.unit_measure,
          quantity: registro.quantity,
          observations: registro.observations,
          modificar: true,
        });
      }
    );
  }

  listarEstadosDesembolso(): void {
    this.cargandoEstadosDesembolso = true;
    this.errorEstadosDesembolso = false;
    this.EstudiosPreviosService.getEstadosDesembolso()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: estados => {
          this.estadosDesembolso = estados;
          this.cargandoEstadosDesembolso = false;
          this.errorEstadosDesembolso = estados.length === 0;
          if (!estados.length) {
            this.snackBar.open('No hay estados de desembolso configurados.', '', {
              duration: 4000,
            });
          }
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.cargandoEstadosDesembolso = false;
          this.errorEstadosDesembolso = true;
          this.snackBar.open('Error al cargar los estados de desembolso.', '', { duration: 4000 });
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  agregarDesembolso(desembolso?: DesembolsoEstudio): void {
    const data: DesembolsoFormData = {
      productos: productosParaDesembolso(
        this.estuPreviosData.objetivos ?? [],
        (this.estuPreviosData.desembolsos ?? []).filter(registro => registro !== desembolso)
      ),
      estados: this.estadosDesembolso,
      desembolso,
    };
    const drawerRef = this.drawer.open<DesembolsosForm, DesembolsoFormData, DesembolsoEstudio>(
      DesembolsosForm,
      { position: 'right', width: '760px', maxWidth: '100vw', data }
    );
    drawerRef
      .afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(registro => {
        if (registro) {
          this.estuPreviosData.desembolsos = desembolso
            ? (this.estuPreviosData.desembolsos ?? []).map(actual =>
                actual === desembolso ? registro : actual
              )
            : [...(this.estuPreviosData.desembolsos ?? []), registro];
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  get totalDesembolsos(): number {
    return (
      (this.estuPreviosData.desembolsos ?? []).reduce(
        (total, desembolso) => total + Math.round(Number(desembolso.value) * 100),
        0
      ) / 100
    );
  }

  nombreEstadoDesembolso(id: number | null): string {
    return this.estadosDesembolso.find(estado => estado.id === id)?.name ?? String(id ?? '');
  }

  productosDesembolso(
    desembolso: DesembolsoEstudio
  ): { key: string; producto: ProductoEstudio | undefined }[] {
    const productos = new Map(
      (this.estuPreviosData.objetivos ?? []).flatMap(objetivo =>
        objetivo.actividades.flatMap(actividad =>
          actividad.productos.map(
            producto =>
              [producto.id ? `id:${producto.id}` : `new:${producto.client_id}`, producto] as const
          )
        )
      )
    );
    return desembolso.product_keys.map(key => ({ key, producto: productos.get(key) }));
  }

  private abrirProducto(
    data: ProductosFormData,
    agregar: (registro: ProductoEstudio) => void
  ): void {
    const drawerRef = this.drawer.open<ProductosForm, ProductosFormData, ProductoEstudio>(
      ProductosForm,
      {
        position: 'right',
        width: '560px',
        maxWidth: '100vw',
        data,
      }
    );
    drawerRef
      .afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(registro => {
        if (registro) {
          agregar(registro);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  volver(): void {
    this.router.navigate(['/acuerdos/estudios-previos']);
  }
}
