import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
import { Subject } from 'rxjs';
import { ViajesItinerario } from 'src/app/models/viajes-itinerario';
import { ViajesHotel } from 'src/app/models/viajes-hotel';
import { AnticiposDetalle } from 'src/app/models/anticipos-detalle';
import { AnticipoForm } from 'src/app/shared/anticipo-form';
import { ChoiceWithIndices, NgxMentionsModule } from 'ngx-mentions';
import { format } from 'date-fns';
import { DomSanitizer } from '@angular/platform-browser';
import {
  getFormattedHighlightText,
  parentCommentStatusBasedStyles,
} from 'src/app/shared/utilmentions';
import { HotelForm } from '../hotel/hotel-form';
import { ItinerarioForm } from '../itinerario/itinerario-form';
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

@Component({
  selector: 'app-acciones',
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
  ],
  templateUrl: './acciones.html',
  styleUrl: './acciones.scss',
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
})
export class AccionesViajes implements OnInit {
  @ViewChild('fRutas') fRutasForm!: NgForm;
  itinerarioChanged$ = new Subject<ViajesItinerario>();
  regresoChanged$ = new Subject<ViajesItinerario>();
  hotelChanged$ = new Subject<ViajesHotel>();
  anticipoChanged$ = new Subject<AnticiposDetalle>();
  dataSourceItinerario = new MatTableDataSource<ViajesItinerario>([]);
  dataSourceHotel = new MatTableDataSource<ViajesHotel>([]);
  dataSourceAnticipo = new MatTableDataSource<AnticiposDetalle>([]);
  fechaInicio?: any = null;
  fechaFin?: any = null;
  fechaNacimiento?: any = null;
  horaInicio?: any = null;
  horaFin?: any = null;
  id_viaje: string = null!;
  accion = 'Nuevo';
  usuariosFilter: ListaGenerica[] = [];
  usuarios: ListaGenerica[] = [];
  choices: ListaGenerica[] = [];
  mentions: ChoiceWithIndices[] = [];
  searchRegexp = new RegExp('^([-&.\\w]+ *){0,3}$');
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  mentionsConfig = [
    {
      triggerCharacter: '@',
      getChoiceLabel: (item: ListaGenerica): string => {
        return `@${item.valor}`;
      },
    },
  ];
  selectedChoices: ChoiceWithIndices[] = [];
  loading = false;
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
    'acciones',
  ];
  displayedColumnsHotel: string[] = [
    'ciudad',
    'fecha_llegada',
    'fecha_salida',
    'observaciones',
    'acciones',
  ];
  displayedColumnsAnticipo: string[] = ['concepto', 'valor', 'observaciones', 'acciones'];
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

    this.dataSourceAnticipo.data = this.viajeData.anticipo?.detalle ?? [];
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
          // this.getHistorialAprobacion(this.viajeData.id_viaje);
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

  agregarHotel() {
    const drawerRef = this.drawer.open(HotelForm, {
      position: 'right',
      width: '30%',
    });
    drawerRef.instance.hotelChanged$ = this.hotelChanged$;
    drawerRef.instance.listados = this.listados;
    drawerRef.instance.minDate = this.fechaInicio ? new Date(this.fechaInicio) : undefined;
    drawerRef.instance.maxDate = this.fechaFin ? new Date(this.fechaFin) : undefined;

    const sub = this.hotelChanged$.subscribe(result => {
      // Resolve text names for visualization in the main table
      const depto = this.listados[0]?.lista_generica?.find(
        p => p.identity === result.id_departamento
      )?.valor;
      const municipio = this.listados[1]?.lista_generica?.find(
        p => p.identity === result.id_municipio
      )?.valor;

      result.departamento = depto;
      result.municipio = municipio;

      this.viajeData.hotel = this.ordenarHoteles([...(this.viajeData.hotel ?? []), result]);
      this.dataSourceHotel.data = this.viajeData.hotel;

      this.snackBar.open('Hotel agregado correctamente', '', { duration: 3000 });
    });

    drawerRef.afterDismissed().subscribe(() => {
      sub.unsubscribe();
    });
  }

  loadChoices({
    searchText,
    triggerCharacter,
  }: {
    searchText: string;
    triggerCharacter: string;
  }): ListaGenerica[] {
    if (triggerCharacter === '@') {
      const searchResults = this.getUsersFilter();
      this.choices = searchResults.filter(user => {
        return user.valor!.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      });
    }

    return this.choices;
  }

  getUsersFilter(): ListaGenerica[] {
    this.usuariosFilter =
      this.usuarios.filter(
        item => !this.mentions.some(mention => mention.choice.identity === Number(item.identity))
      ) || [];
    return this.usuariosFilter;
  }

  onSelectedChoicesChange(choices: ChoiceWithIndices[]): void {
    this.mentions = choices;
    getFormattedHighlightText(
      this.viajeData.observaciones_adicionales || '',
      this.mentions,
      parentCommentStatusBasedStyles,
      this.sanitizer
    );
  }

  onMenuShow(): void {}

  onMenuHide(): void {
    this.choices = [];
  }

  getDisplayLabel = (item: ListaGenerica): string => {
    if (item && 'valor' in item) {
      return (item as ListaGenerica).valor!;
    }
    return '';
  };
  getChoiceId = (item: ListaGenerica): string => {
    if (item && 'id' in item) {
      return (item as ListaGenerica).identity!.toString();
    }
    return '';
  };

  agregarAnticipo() {
    const drawerRef = this.drawer.open(AnticipoForm, {
      position: 'right',
      width: '30%',
    });
    drawerRef.instance.anticipoChanged$ = this.anticipoChanged$;
    drawerRef.instance.listados = this.listados;

    const sub = this.anticipoChanged$.subscribe(result => {
      if (!this.viajeData.anticipo) {
        this.viajeData.anticipo = {
          detalle: [],
        };
      }
      const concepto = this.listados[4]?.lista_generica?.find(
        p => p.identity === result.id_concepto
      )?.valor;

      result.concepto = concepto;
      this.viajeData.anticipo.detalle = [...(this.viajeData.anticipo.detalle ?? []), { ...result }];

      this.dataSourceAnticipo.data = this.viajeData.anticipo.detalle;
      this.snackBar.open('Anticipo agregado correctamente', '', { duration: 3000 });
    });

    drawerRef.afterDismissed().subscribe(() => {
      sub.unsubscribe();
    });
  }

  agregarItinerario() {
    const drawerRef = this.drawer.open(ItinerarioForm, {
      position: 'right',
      width: '40%',
    });
    drawerRef.instance.itinerarioChanged$ = this.itinerarioChanged$;
    drawerRef.instance.regresoChanged$ = this.regresoChanged$;
    drawerRef.instance.listados = this.listados;
    drawerRef.instance.minDate = this.fechaInicio ? new Date(this.fechaInicio) : undefined;
    drawerRef.instance.maxDate = this.fechaFin ? new Date(this.fechaFin) : undefined;

    const sub = this.itinerarioChanged$.subscribe(result => {
      // Resolve text names for visualization in the main table
      const deptoOrigen = this.listados[0]?.lista_generica?.find(
        p => p.identity === result.id_departamento_origen
      )?.valor;
      const munOrigen = this.listados[1]?.lista_generica?.find(
        p => p.identity === result.id_municipio_origen
      )?.valor;
      const deptoDestino = this.listados[0]?.lista_generica?.find(
        p => p.identity === result.id_departamento_destino
      )?.valor;
      const munDestino = this.listados[1]?.lista_generica?.find(
        p => p.identity === result.id_municipio_destino
      )?.valor;

      result.departamento_origen = deptoOrigen;
      result.municipio_origen = munOrigen;
      result.departamento_destino = deptoDestino;
      result.municipio_destino = munDestino;

      this.viajeData.itinerario = this.ordenarItinerario([
        ...(this.viajeData.itinerario ?? []),
        result,
      ]);
      this.dataSourceItinerario.data = this.viajeData.itinerario;

      this.snackBar.open('Itinerario agregado correctamente', '', { duration: 3000 });
    });

    const subRegreso = this.regresoChanged$.subscribe(result => {
      // Resolve text names for visualization in the main table
      const deptoOrigen = this.listados[0]?.lista_generica?.find(
        p => p.identity === result.id_departamento_origen
      )?.valor;
      const munOrigen = this.listados[1]?.lista_generica?.find(
        p => p.identity === result.id_municipio_origen
      )?.valor;
      const deptoDestino = this.listados[0]?.lista_generica?.find(
        p => p.identity === result.id_departamento_destino
      )?.valor;
      const munDestino = this.listados[1]?.lista_generica?.find(
        p => p.identity === result.id_municipio_destino
      )?.valor;

      result.departamento_origen = deptoOrigen;
      result.municipio_origen = munOrigen;
      result.departamento_destino = deptoDestino;
      result.municipio_destino = munDestino;

      this.viajeData.itinerario = this.ordenarItinerario([
        ...(this.viajeData.itinerario ?? []),
        result,
      ]);
      this.dataSourceItinerario.data = this.viajeData.itinerario;

      // this.snackBar.open('Itinerario agregado correctamente', '', { duration: 3000 });
    });

    drawerRef.afterDismissed().subscribe(() => {
      sub.unsubscribe();
      subRegreso.unsubscribe();
    });
  }

  eliminarItinerario(index: number) {
    if (this.viajeData.itinerario) {
      this.viajeData.itinerario.splice(index, 1);
      this.dataSourceItinerario.data = [...this.viajeData.itinerario];
    }
  }

  editarItinerario(index: number) {
    if (this.viajeData.itinerario) {
      // const dialogConfig = new MatDialogConfig();
      // dialogConfig.disableClose = false;
      // dialogConfig.autoFocus = true;
      // dialogConfig.width = "60%";
      // const dialogRef = this.dialog.open(ItinerarioFormComponent, {
      //   // height: "calc(100% - 30px)",
      //   // width: "calc(100% - 30px)",
      //   // maxWidth: "100%",
      //   // maxHeight: "100%"
      // });
      // this.viajeData.fecha_inicio_viaje = this.fechaInicio ? this.fechaInicio.toDate() : this.viajeData.fecha_inicio_viaje;
      // this.viajeData.fecha_fin_viaje = this.fechaFin ? this.fechaFin.toDate() : this.viajeData.fecha_fin_viaje;
      // this.viajeData.hora_inicio = this.horaInicio ? this.horaInicio.format('HH:mm') : this.viajeData.hora_inicio;
      // this.viajeData.hora_fin = this.horaFin ? this.horaFin.format('HH:mm') : this.viajeData.hora_fin;
      // dialogRef.componentInstance.minDate = this.viajeData.fecha_inicio_viaje || new Date();
      // dialogRef.componentInstance.maxDate = this.viajeData.fecha_fin_viaje || new Date();
      // dialogRef.componentInstance.listados = this.listados;
      // dialogRef.componentInstance.asociadoTaller = this.viajeData.asociado_taller || false;
      // dialogRef.componentInstance.itinerario = { ...this.viajeData.itinerario[index] }; // Pasar una copia del objeto
      // dialogRef.componentInstance.municipioOrigen();
      // dialogRef.componentInstance.itinerario.id_municipio_origen = this.viajeData.itinerario[index].id_municipio_origen;
      // dialogRef.componentInstance.municipioDestino();
      // dialogRef.componentInstance.itinerario.id_municipio_destino = this.viajeData.itinerario[index].id_municipio_destino;
      // dialogRef.componentInstance.fechaViaje = moment(this.viajeData.itinerario[index].fecha).startOf('day').local();
      // dialogRef.componentInstance.horaViaje = moment(this.viajeData.itinerario[index].hora ? this.viajeData.itinerario[index].hora : null, 'HH:mm');
      // dialogRef.componentInstance.esEdicion = true;
      // dialogRef.componentInstance.dataChanged.subscribe((data: ViajesItinerario) => {
      //   this.viajeData.itinerario![index] = data;
      //   this.viajeData.itinerario = [...this.viajeData.itinerario!];
      // });
    }
  }
  eliminarHotel(index: number) {
    // if (this.viajeData.hotel) {
    //   this.viajeData.hotel.splice(index, 1);
    //   this.dataSourceHotel.data = [...this.viajeData.hotel];
    // }
  }
  editarHotel(index: number) {}
  eliminarAnticipo(index: number) {
    // if (this.viajeData.anticipo?.detalle) {
    //   this.viajeData.anticipo.detalle.splice(index, 1);
    //   this.dataSourceAnticipo.data = [...this.viajeData.anticipo.detalle];
    // }
  }
  editarAnticipo(index: number) {}

  accionSolicitud(tipo_accion: string) {}
  guardarViaje(anviar_aprobacion = false) {
    this.isLoading = true; //  Mostrar spinner o deshabilitar botón
    // this.viajeData.anticipo!.id_entidad_bancaria = this.viajeData.id_entidad_bancaria;
    // this.viajeData.anticipo!.numero_cuenta = this.viajeData.numero_cuenta;
    const esNuevo = !this.viajeData.id_viaje || this.viajeData.id_viaje == 0;
    this.viajeData.id_rol_aprobacion_supervisor =
      this.listados[5]?.lista_generica?.find(
        item => item.idrelacion == this.viajeData.id_supervisor_aprueba
      )?.identity || undefined;

    this.viajeData.fecha_inicio_viaje = this.fechaInicio;
    this.viajeData.fecha_fin_viaje = this.fechaFin;
    this.viajeData.fecha_nacimiento_viajero = this.fechaNacimiento;
    this.viajeData.hora_inicio = this.horaInicio
      ? this.horaInicio.format('HH:mm')
      : this.viajeData.hora_inicio;
    this.viajeData.hora_fin = this.horaFin ? this.horaFin.format('HH:mm') : this.viajeData.hora_fin;

    this.viajeData.id_usuarios_mencion = [];
    this.mentions.forEach(mention => {
      this.viajeData.id_usuarios_mencion!.push(Number(mention.choice.identity));
    });

    this.viajeData.menciones_json = JSON.stringify(this.mentions);

    // this.viajeData.fecha_nacimiento_viajero = this.fecha_nacimiento ? this.fecha_nacimiento.format('YYYY-MM-DD') : null;
    // this.viajeData.fecha_inicio_viaje = new Date(this.viajeData.fecha_inicio_viaje!.toISOString().split('T')[0]);
    // this.viajeData.fecha_fin_viaje = new Date(this.viajeData.fecha_fin_viaje!.toISOString().split('T')[0]);
    this.viajeData.enviar_aprobacion = anviar_aprobacion; // Asignar el valor del botón
    console.log('Datos del viaje a guardar:', esNuevo);
    const request$ = esNuevo
      ? this.service.saveViaje(this.viajeData)
      : this.service.updateViaje(this.viajeData);

    request$.subscribe({
      next: response => {
        this.responseRequest = response;
        // this.isLoading = false; //  Ocultar spinner
        if (this.responseRequest.solicitud_exitosa) {
          const mensaje = esNuevo ? 'Viaje creado exitosamente' : 'Viaje actualizado correctamente';
          // this.toastr.success(mensaje, 'OK', {
          //   timeOut: 3000, positionClass: 'toast-top-center',
          // });
          this.router.navigate(['/viajes/listar']);
        } else {
          // this.toastr.error('La operación no fue exitosa', 'Advertencia', {
          //   timeOut: 3000, positionClass: 'toast-top-center',
          // });
        }
      },
      error: () => {
        this.isLoading = false; //  Ocultar spinner si hay error
        const mensajeError = esNuevo ? 'Error al guardar el viaje' : 'Error al actualizar el viaje';
        // this.toastr.error(mensajeError, 'Error', {
        //   timeOut: 3000, positionClass: 'toast-top-center',
        // });
      },
    });
  }
}
