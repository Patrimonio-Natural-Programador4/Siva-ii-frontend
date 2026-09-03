import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { PageHeader } from '@shared';
import { ListaGenerica } from 'src/app/models/lista-generica';
import { Listados } from 'src/app/models/listados';
import { ResponseRequest } from 'src/app/models/response-request';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { Viajes } from 'src/app/models/viajes';
import { ViajesService } from 'src/app/services/viajes.service';
import { MtxDrawer, MtxDrawerModule } from '@ng-matero/extensions/drawer';
import { MatTableDataSource } from '@angular/material/table';
import {
  getFormattedHighlightText,
  parentCommentStatusBasedStyles,
} from 'src/app/shared/utilmentions';
import { numeroALetrasEspanol } from 'src/app/shared/utils';
// import { ToastrService } from 'ngx-toastr';

export const MY_FORMATS = {
  parse: {
    dateInput: 'yyyy-MM-dd',
    timeInput: 'HH:mm',
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'yyyy MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'yyyy MMMM dd',
    timeInput: 'HH:mm',
    timeOptionLabel: 'HH:mm',
  },
};

import { LegalizacionForm } from '../legalizacion-form';
import { TravelLegalization } from 'src/app/models/travel-legalization';

@Component({
  selector: 'app-detalle-legalizacion',
  imports: [
    PageHeader,
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepicker,
    MatDatepickerModule,
    MtxDrawerModule,
    NgxMentionsModule,
    TextFieldModule,
  ],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
})
export class DetalleLegalizacion implements OnInit {
  @ViewChild('fRutas') fRutasForm!: NgForm;
  @ViewChild('abcTextarea') abcTextarea?: ElementRef<HTMLTextAreaElement>;
  
  dataSourceItinerario = new MatTableDataSource<ViajesItinerario>([]);
  dataSourceHotel = new MatTableDataSource<ViajesHotel>([]);
  dataSourceLegalizaciones = new MatTableDataSource<TravelLegalization>([]);
  
  fechaInicio?: any = null;
  fechaFin?: any = null;
  fechaNacimiento?: any = null;
  horaInicio?: any = null;
  horaFin?: any = null;
  id_viaje: string = null!;
  accion: string = 'Legalización';
  
  usuariosFilter: ListaGenerica[] = [];
  usuarios: ListaGenerica[] = [];
  choices: ListaGenerica[] = [];
  mentions: ChoiceWithIndices[] = [];
  
  valorAnticipoLetras = '';
  viajeData: Viajes = {
    itinerario: [],
    hotel: [],
    asociado_taller: false,
    dos_o_mas_personas: false,
    soporte_dos_o_mas_personas: '',
    nombre_archivo_dos_o_mas_personas: '',
    id_rol_aprobacion_supervisor: null!,
    guid: null!,
    id_supervisor_aprueba: null!,
    id_programa: null!,
    id_tipo_cuenta: null!,
    id_entidad_bancaria: null!,
    guid_soporte_pasaporte: '',
    anticipo: {
      id_anticipo: null!,
      id_relacion: null!,
      id_tipo_anticipo: null!,
      detalle: [],
    },
  };
  
  displayedColumns: string[] = [
    'origen',
    'fecha',
    'destino',
    'requiere_tiquetes',
    'zona_rural',
    'observaciones_zona_rural',
    'observaciones',
  ];
  displayedColumnsHotel: string[] = [
    'ciudad',
    'fecha_llegada',
    'fecha_salida',
    'observaciones',
  ];
  displayedColumnsLegalizacion: string[] = [
    'check_date',
    'check_number',
    'beneficiary',
    'nit_beneficiary',
    'regimen_name',
    'subtotal',
    'iva',
    'retention_porcentage',
    'retention',
    'amount_paid',
    'observations',
    'acciones'
  ];
  private readonly service = inject(ViajesService);
  private readonly snackBar = inject(MatSnackBar);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  // private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly drawer = inject(MtxDrawer);
  private readonly cdr = inject(ChangeDetectorRef);

  get rubroOptions(): ListaGenerica[] {
    return this.listados[8]?.lista_generica ?? [];
  }

  get filteredRubros(): ListaGenerica[] {
    const term = this.rubroSearch?.trim().toLowerCase() ?? '';

    if (!term) {
      return this.rubroOptions;
    }

    return this.rubroOptions.filter(option => option.valor?.toLowerCase().includes(term));
  }

  isLoading = false;
  isLinear = true;
  listados: Listados[] = [];
  listaRoles: ListaGenerica[] = [];
  numeroRolesAsignados: number | null = null;
  fecha_solicitud: Date = new Date();
  rubroSearch = '';
  showRubroDropdown = false;

  // Subir archivo Excel (.xlsx) para dos o más personas
  archivoExcelBase64: string | null = null;
  archivoExcelNombre = '';
  errorArchivoExcel = '';
  archivoExcelTouched = false;

  responseRequest = new ResponseRequest({
    mensaje: '',
    identity: null!,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    this.id_viaje = this.activatedRoute.snapshot.params['id'];
    this.accion = this.id_viaje ? 'Editar' : 'Nuevo';
    this.getListados();
    if (this.id_viaje) {
      this.getHistorialAprobacion();
      this.getValidacionAccionesAprobacion();
      this.getViaje();
    }
  }

  validarFecha() {}

  onEsInvitadoChange(valor: boolean): void {
    this.viajeData.es_invitado = valor;
    if (!valor) {
      this.viajeData.dos_o_mas_personas = false;
      this.onDosOMasPersonasChange(false);
      this.viajeData.documento_persona_invitada = '';
      this.viajeData.persona_invitada = '';
      this.viajeData.correo_persona_invitada = '';
    }
  }

  onDosOMasPersonasChange(valor: boolean): void {
    this.viajeData.dos_o_mas_personas = valor;
    if (!valor) {
      this.archivoExcelBase64 = null;
      this.archivoExcelNombre = '';
      this.errorArchivoExcel = '';
      this.archivoExcelTouched = false;
      this.viajeData.soporte_dos_o_mas_personas = '';
      this.viajeData.nombre_archivo_dos_o_mas_personas = '';
    }
  }

  onArchivoDosOMasChange(event: Event): void {
    this.archivoExcelTouched = true;
    this.errorArchivoExcel = '';
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith('.xlsx')) {
        this.errorArchivoExcel = 'Solo se permiten archivos con formato .xlsx (Excel).';
        this.archivoExcelBase64 = null;
        this.archivoExcelNombre = '';
        this.viajeData.soporte_dos_o_mas_personas = '';
        this.viajeData.nombre_archivo_dos_o_mas_personas = '';
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.archivoExcelBase64 = reader.result as string;
        this.archivoExcelNombre = file.name;
        this.viajeData.soporte_dos_o_mas_personas = this.archivoExcelBase64;
        this.viajeData.nombre_archivo_dos_o_mas_personas = file.name;
        this.cdr.markForCheck();
      };
      reader.onerror = () => {
        this.errorArchivoExcel = 'Error al leer el archivo. Inténtelo nuevamente.';
        this.archivoExcelBase64 = null;
        this.archivoExcelNombre = '';
        this.viajeData.soporte_dos_o_mas_personas = '';
        this.viajeData.nombre_archivo_dos_o_mas_personas = '';
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    } else {
      this.archivoExcelBase64 = null;
      this.archivoExcelNombre = '';
      this.viajeData.soporte_dos_o_mas_personas = '';
      this.viajeData.nombre_archivo_dos_o_mas_personas = '';
    }
  }

  private ordenarItinerario(itinerario: ViajesItinerario[] = []): ViajesItinerario[] {
    return [...itinerario].sort((a, b) => {
      const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;

      if (fechaA !== fechaB) {
        return fechaA - fechaB;
      }

      const horaA = this.parsearHora(a.hora);
      const horaB = this.parsearHora(b.hora);
      return horaA - horaB;
    });
  }

  private parsearHora(hora?: string): number {
    if (!hora) {
      return 0;
    }

    const [horas = 0, minutos = 0] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  private ordenarHoteles(hoteles: ViajesHotel[] = []): ViajesHotel[] {
    return [...hoteles].sort((a, b) => {
      const fechaLlegadaA = a.fecha_llegada ? new Date(a.fecha_llegada).getTime() : 0;
      const fechaLlegadaB = b.fecha_llegada ? new Date(b.fecha_llegada).getTime() : 0;
      return fechaLlegadaA - fechaLlegadaB;
    });
  }

  private getViaje(): void {
    this.isLoading = true;
    this.service.getViajeById(this.id_viaje).subscribe(
      data => {
        this.viajeData = data;
        this.dataSourceItinerario.data = this.viajeData.itinerario ?? [];
        this.dataSourceHotel.data = this.viajeData.hotel ?? [];
        this.fechaInicio = this.viajeData.fecha_inicio_viaje;
        this.fechaFin = this.viajeData.fecha_fin_viaje;
        this.fechaNacimiento = this.viajeData.fecha_nacimiento_viajero;
        this.syncRubroSelection();
        if (this.viajeData.soporte_dos_o_mas_personas) {
          this.archivoExcelBase64 = this.viajeData.soporte_dos_o_mas_personas;
          this.archivoExcelNombre =
            this.viajeData.nombre_archivo_dos_o_mas_personas || 'archivo.xlsx';
        }

        if (this.viajeData.id_viaje) {
          this.service.getLegalizacionByTravelId(this.viajeData.id_viaje).subscribe({
            next: (legs: any) => {
              if (Array.isArray(legs)) {
                this.dataSourceLegalizaciones.data = legs;
              } else if (legs) {
                this.dataSourceLegalizaciones.data = [legs];
              } else {
                this.dataSourceLegalizaciones.data = [];
              }
            },
            error: () => {
              this.dataSourceLegalizaciones.data = [];
            }
          });
        }
        
        this.getValidacionAccionesAprobacion();
        this.isLoading = false;
      },
      error => {
        this.snackBar.open('Error al cargar el viaje', '', { duration: 3000 });
        this.isLoading = false;
      }
    );
  }

  getHistorialAprobacion() {
    // this.viajeService.getHistorialAprobacion(this.id_viaje, 'SV').subscribe(data => {
    //   if (data) {
    //     this.historialAprobacion = data;
    //   }
    // }, error => {
    //   this.toastr.error("Error al cargar la solicitud de aprobación", 'Error', {
    //     timeOut: 3000, positionClass: 'toast-top-center',
    //   });
    // });
  }

  getValidacionAccionesAprobacion() {
    // this.service.getValidacionAccionesAprobacion(this.id_viaje, 'SV').subscribe(data => {
    //   if (data) {
    //     this.validacionAcciones = data;
    //     this.habilitarAcciones = this.validacionAcciones.solicitud_exitosa;
    //     if (this.validacionAcciones.solicitud_exitosa) {
    //       this.acciones = JSON.parse(this.validacionAcciones.mensaje);
    //       if (this.acciones.usuario_solicito == false) {
    //         this.router.navigate(['/viajes/detalle', this.id_viaje]);
    //       }
    //       // this.acciones.asigna_presupuesto_viajes = this.accionesSolicitud.asigna_presupuesto_viajes;
    //       // this.acciones.ajusta_itinerario_viajes = this.accionesSolicitud.ajusta_itinerario_viajes;
    //       // this.acciones.valida_soportes = this.accionesSolicitud.valida_soportes;
    //     //   if (this.acciones.ajusta_itinerario_viajes) {
    //     //     this.displayedColumns.push('acciones');
    //     //   }
    //     //   this.getViaje();
    //     // }
    //     // else {
    //     //   this.acciones = JSON.parse(this.validacionAcciones.mensaje);
    //     //   if (this.acciones.usuario_solicito == false) {
    //     //     this.router.navigate(['/viajes/detalle', this.id_viaje]);
    //     //   }
    //     //   else {
    //     //     this.getViaje(true);
    //     //   }
    //     // }
    //   }
    // }, error => {
    //   this.toastr.error("Error al cargar la validación de acciones", 'Error', {
    //     timeOut: 3000, positionClass: 'toast-top-center',
    //   });
    // });
  }

  onObservacionesChange(event: any) {
    getFormattedHighlightText(event, this.mentions, parentCommentStatusBasedStyles, this.sanitizer);
  }

  onRubroSearchChange(value: string): void {
    this.rubroSearch = value ?? '';
    this.showRubroDropdown = true;

    if (!this.rubroSearch.trim()) {
      this.viajeData.id_rubro = null!;
    }
  }

  onRubroFocus(): void {
    this.showRubroDropdown = true;
  }

  onRubroBlur(): void {
    // Delay avoids blur firing before option click is processed.
    setTimeout(() => {
      this.showRubroDropdown = false;
    }, 120);
  }

  selectRubro(option: ListaGenerica): void {
    this.viajeData.id_rubro = option.identity;
    this.rubroSearch = option.valor ?? '';
    this.showRubroDropdown = false;
    const rubro = this.listados[8]?.lista_generica?.find(r => r.identity === option.identity);
    this.viajeData.actividad = rubro?.valor_referencia ?? '';
    this.viajeData.id_actividad = rubro?.idrelacion ?? null!;
    this.viajeData.rubro_corto = rubro?.valor_referencia2 ?? '';
  }

  private syncRubroSelection(): void {
    const selected = this.rubroOptions.find(option => option.identity === this.viajeData.id_rubro);
    this.rubroSearch = selected?.valor ?? '';
  }

  getListados(): void {
    this.service.getListados().subscribe({
      next: data => {
        setTimeout(() => {
          this.listados = data;
          this.usuarios = this.listados[7]?.lista_generica ?? [];
          this.usuariosFilter = this.usuarios;
          this.syncRubroSelection();
        });
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los listados', '', { duration: 3000 });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/viajes/listar']);
  }

  agregarLegalizacion(): void {
    if (!this.viajeData?.id_viaje) return;
    const drawerRef = this.drawer.open(LegalizacionForm, {
      position: 'right',
      width: '40%',
    });
    drawerRef.instance.travelRequestId = this.viajeData.id_viaje;
    drawerRef.afterDismissed().subscribe(res => {
      if (res && this.viajeData?.id_viaje) {
        this.getViaje();
      }
    });
  }

  editarLegalizacion(leg: TravelLegalization): void {
    this.router.navigate(['/viajes/legalizacion/ver', this.viajeData.id_viaje, leg.legalization_id]);
  }
}
