import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { AcquisitionsListSP } from 'src/app/models/acquisitions';
import { AcquisitionsService } from 'src/app/services/acquisitions/acquisitions.service';

@Component({
  selector: 'app-adquisiciones-tabla',
  imports: [
    PageHeader,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    UpperCasePipe,
  ],
  templateUrl: './adquisiciones-tabla.html',
  styleUrl: './adquisiciones-tabla.scss',
})
export class AdquisicionesTabla implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly AcquisitionsService = inject(AcquisitionsService);
  readonly paginator = viewChild(MatPaginator);

  readonly columnasDisponibles: {
    key: string;
    label: string;
    tipo: 'texto' | 'fecha' | 'moneda';
    campo?: keyof AcquisitionsListSP;
    decimales?: number;
  }[] = [
    { key: 'process_number', label: 'No. Proceso', tipo: 'texto', campo: 'process_number' },
    { key: 'pid_id', label: 'PAD', tipo: 'texto', campo: 'pad_name' },
    { key: 'pillar_id', label: 'Pilar', tipo: 'texto', campo: 'pillar_name' },
    { key: 'activity_id', label: 'No. de Actividad', tipo: 'texto', campo: 'activity_code' },
    { key: 'description', label: 'Nombre Actividad', tipo: 'texto', campo: 'activity_description' },
    { key: 'code_siva', label: 'Código SIVA', tipo: 'texto', campo: 'code_siva' },
    {
      key: 'implementer_name',
      label: 'Entidad Implementadora',
      tipo: 'texto',
      campo: 'implementer_name',
    },
    {
      key: 'person_id_executer',
      label: 'Entidad Ejecutora',
      tipo: 'texto',
      campo: 'executer_name',
    },
    { key: 'rubro_id', label: 'Rubro', tipo: 'texto', campo: 'rubro_name' },
    { key: 'rubro_vig', label: 'Rubros por vigencia', tipo: 'texto', campo: 'rubro_corto' },
    {
      key: 'general_cat_id',
      label: 'Categoría general',
      tipo: 'texto',
      campo: 'general_category_name',
    },
    {
      key: 'expense_category_id',
      label: 'Tipo de categoría',
      tipo: 'texto',
      campo: 'expense_category_name',
    },
    {
      key: 'purchase_type_id',
      label: 'Tipo de contratación',
      tipo: 'texto',
      campo: 'purchase_type_name',
    },
    { key: 'contracts_qty', label: 'N°. contratos', tipo: 'texto', campo: 'contracts_qty' },
    { key: 'detail', label: 'Detalle', tipo: 'texto', campo: 'detail' },
    { key: 'code', label: 'Código Excel', tipo: 'texto', campo: 'code' },
    {
      key: 'cod_siva_acuerdo',
      label: 'Código SIVA Acuerdo',
      tipo: 'texto',
      campo: 'cod_siva_acuerdo',
    },
    {
      key: 'cod_siva_contrato',
      label: 'Código SIVA Contrato',
      tipo: 'texto',
      campo: 'cod_siva_contrato',
    },
    { key: 'observations', label: 'Observaciones', tipo: 'texto', campo: 'observations' },
    { key: 'status', label: 'Estado', tipo: 'texto', campo: 'status_name' },
    { key: 'kfw_id', label: 'KFW', tipo: 'texto', campo: 'kfw_name' },
    { key: 'departamento', label: 'Departamento', tipo: 'texto', campo: 'departamento' },
    { key: 'municipio', label: 'Municipio', tipo: 'texto', campo: 'municipio' },
    { key: 'village', label: 'Vereda', tipo: 'texto', campo: 'vereda' },
    {
      key: 'policy_date',
      label: 'Fecha aprobación póliza (acuerdos)',
      tipo: 'fecha',
      campo: 'policy_date',
    },
    {
      key: 'start_contract_date',
      label: 'Fecha aprobación póliza (contratos)',
      tipo: 'fecha',
      campo: 'start_contract_date',
    },
    {
      key: 'finish_date',
      label: 'Fecha final inicial (acuerdos)',
      tipo: 'fecha',
      campo: 'finish_date',
    },
    {
      key: 'end_contract_date',
      label: 'Fecha final inicial (contratos)',
      tipo: 'fecha',
      campo: 'end_contract_date',
    },
    { key: 'final_date', label: 'Fecha fin final (acuerdos)', tipo: 'fecha', campo: 'final_date' },
    {
      key: 'final_date_con',
      label: 'Fecha fin final (contratos)',
      tipo: 'fecha',
      campo: 'final_date_con',
    },
    {
      key: 'liquidation_date',
      label: 'Fecha acta liquidación (acuerdos)',
      tipo: 'fecha',
      campo: 'liquidation_date',
    },
    {
      key: 'early_settlement_date',
      label: 'Fecha acta liquidación (contratos)',
      tipo: 'fecha',
      campo: 'early_settlement_date',
    },
    {
      key: 'initial_budget_cop',
      label: 'Presupuesto COP (Inicial)',
      tipo: 'moneda',
      campo: 'initial_budget_cop',
      decimales: 0,
    },
    {
      key: 'initial_budget_usd',
      label: 'Presupuesto USD (Inicial)',
      tipo: 'moneda',
      campo: 'initial_budget_usd',
      decimales: 2,
    },
    {
      key: 'initial_budget_eur',
      label: 'Presupuesto EUR (Inicial)',
      tipo: 'moneda',
      campo: 'initial_budget_eur',
      decimales: 2,
    },
    {
      key: 'final_budget_cop',
      label: 'Presupuesto COP (Final)',
      tipo: 'moneda',
      campo: 'final_budget_cop',
      decimales: 0,
    },
    {
      key: 'final_budget_usd',
      label: 'Presupuesto USD (Final)',
      tipo: 'moneda',
      campo: 'final_budget_usd',
      decimales: 2,
    },
    {
      key: 'final_budget_eur',
      label: 'Presupuesto EUR (Final)',
      tipo: 'moneda',
      campo: 'final_budget_eur',
      decimales: 2,
    },
    { key: 'appropriate', label: 'Apropiado', tipo: 'moneda', campo: 'appropriate', decimales: 0 },
    {
      key: 'appropriate_sicof',
      label: 'Apropiado SICOF',
      tipo: 'moneda',
      campo: 'appropriate_sicof',
      decimales: 0,
    },
    {
      key: 'appropriate_pending',
      label: 'Por apropiar',
      tipo: 'moneda',
      campo: 'appropriate_pending',
      decimales: 0,
    },
    {
      key: 'fulfilled',
      label: 'Ejecutado/Pagado',
      tipo: 'moneda',
      campo: 'fulfilled',
      decimales: 0,
    },
    {
      key: 'execute_sicof',
      label: 'Ejecutado/Pagado SICOF',
      tipo: 'moneda',
      campo: 'execute_sicof',
      decimales: 0,
    },
    {
      key: 'unfulfilled',
      label: 'Sin ejecutar',
      tipo: 'moneda',
      campo: 'unfulfilled',
      decimales: 0,
    },
    {
      key: 'value',
      label: 'Valor total inicial (acuerdos)',
      tipo: 'moneda',
      campo: 'value',
      decimales: 0,
    },
    {
      key: 'value_con',
      label: 'Valor total inicial (contratos)',
      tipo: 'moneda',
      campo: 'initial_budget_cop',
      decimales: 2,
    },
    {
      key: 'total_final_value',
      label: 'Valor total final (acuerdos)',
      tipo: 'moneda',
      campo: 'total_final_value',
      decimales: 0,
    },
    {
      key: 'total_final_value_con',
      label: 'Valor total final (contratos)',
      tipo: 'moneda',
      campo: 'final_budget_cop',
      decimales: 2,
    },
    { key: 'acciones', label: 'Acciones', tipo: 'texto' },
  ];

  readonly columnasPorDefecto = [
    'process_number',
    'pid_id',
    'activity_id',
    'rubro_vig',
    'description',
    'initial_budget_cop',
    'final_budget_cop',
    'initial_budget_usd',
    'final_budget_usd',
    'initial_budget_eur',
    'final_budget_eur',
    'fulfilled',
    'execute_sicof',
    'unfulfilled',
    'appropriate',
    'appropriate_sicof',
    'appropriate_pending',
    'observations',
    'policy_date',
    'start_contract_date',
    'finish_date',
    'end_contract_date',
    'final_date',
    'final_date_con',
    'liquidation_date',
    'early_settlement_date',
    'value',
    'value_con',
    'total_final_value',
    'total_final_value_con',
    'pillar_id',
    'departamento',
    'municipio',
    'village',
    'acciones',
  ];

  readonly columnasRestablecer = [
    'process_number',
    'pid_id',
    'activity_id',
    'rubro_vig',
    'description',
    'initial_budget_cop',
    'final_budget_cop',
    'initial_budget_usd',
    'final_budget_usd',
    'fulfilled',
    'unfulfilled',
    'appropriate',
    'appropriate_pending',
    'observations',
    'acciones',
  ];

  readonly camposDinero = [
    'initial_budget_cop',
    'initial_budget_usd',
    'initial_budget_eur',
    'final_budget_cop',
    'final_budget_usd',
    'final_budget_eur',
    'appropriate',
    'appropriate_sicof',
    'appropriate_pending',
    'fulfilled',
    'execute_sicof',
    'unfulfilled',
    'value',
    'value_con',
    'total_final_value',
    'total_final_value_con',
  ];

  private readonly storageKey = 'acquisitions_columnas';

  columnas: string[] = []; // columnas que se pintan en la tabla
  columnasVisibles: string[] = []; // seleccionadas en "Mostrar columnas"
  columnasTotalGeneral: string[] = [];
  columnasSubtotal: string[] = [];

  readonly pageSizeOptions = [25];
  adquisiciones: AcquisitionsListSP[] = [];
  total = 0;
  currentPage = 0;
  cargando = false;

  totalesGenerales: Record<string, number> = {};
  totalesPagina: Record<string, number> = {};

  pads: { id: number; pad: string }[] = [];
  actividades: { id: number; code: string }[] = [];
  listaProcesos: string[] = [];

  filtrobusqueda = '';
  id_pid = -1;
  id_actividad = -1;
  id_procesos: string[] = [];

  esGestor = true;
  puedeGestionarLineas = true;

  ngOnInit(): void {
    this.cargarColumnas();
    this.getAdquisiciones();
    this.listarCatalogos();
  }

  ngAfterViewInit(): void {}

  getAdquisiciones(): void {
    this.filtrarDatos();
  }

  filtroText(valor: string): void {
    this.filtrobusqueda = valor;
    this.filtrarDatos(true);
  }

  pageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.filtrarDatos();
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();

    if (!paginator) return index + 1;
    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  getRowClass(row: AcquisitionsListSP, index: number): string {
    switch (row.status_name) {
      case 'Contratado':
        return 'fila-contratado';
      case 'Pendiente por Contratar':
        return 'fila-pendiente';
      case 'Cancelado':
        return 'fila-cancelado';
      case 'Ejecutado':
        return 'fila-ejecutado';
      default:
        return index % 2 === 0 ? 'fila-impar' : '';
    }
  }

  getEstadoClass(estado?: string | null): string {
    switch (estado) {
      case 'Contratado':
        return 'estado estado-contratado';
      case 'Pendiente por Contratar':
        return 'estado estado-pendiente';
      case 'Cancelado':
        return 'estado estado-cancelado';
      case 'Ejecutado':
        return 'estado estado-ejecutado';
      default:
        return '';
    }
  }

  crear(): void {
    this.router.navigate(['adquisiciones/crear']);
  }

  editAdquisicion(id?: number | null) {
    this.router.navigate(['adquisiciones/editar', id]);
  }

  verAdquisicion(id?: number | null) {
    this.router.navigate(['adquisiciones/detalle', id]);
  }

  verAcuerdo(id?: number | null) {
    this.router.navigate(['acuerdos/detalle', id]);
  }

  verContrato(id?: number | null) {
    this.router.navigate(['contratos/detalle', id]);
  }

  verMovimientos(id?: number | null) {
    this.router.navigate(['adquisiciones/movimientos', id]);
  }

  filtrarDatos(filtrar = false) {
    if (filtrar) {
      this.currentPage = 0;
    }
    this.cargando = true;

    this.AcquisitionsService.getAcquisitionsFilter(
      this.currentPage + 1,
      this.filtrobusqueda,
      this.id_pid,
      this.id_actividad,
      this.id_procesos
    ).subscribe({
      next: response => {
        console.log('respuesta', response);

        this.adquisiciones = response ?? [];
        this.total = response.length > 0 ? response[0].total_records! : 0;
        this.calcularTotales();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al listar adquisiciones:', error);
        this.cargando = false;
        this.snackBar.open('Error al cargar las adquisiciones', '', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  calcularTotales(): void {
    const fila = this.adquisiciones[0];
    this.totalesGenerales = {};
    this.totalesPagina = {};

    this.camposDinero.forEach(campo => {
      this.totalesGenerales[campo] = Number(
        fila?.[`grand_${campo}` as keyof AcquisitionsListSP] ?? 0
      );
      this.totalesPagina[campo] = Number(fila?.[`page_${campo}` as keyof AcquisitionsListSP] ?? 0);
    });
  }

  // Llena PAD, actividades y procesos con GET /adquisiciones
  listarCatalogos() {
    this.AcquisitionsService.getAcquisitions().subscribe({
      next: r => {
        const pads = new Map<number, string>();
        const actividades = new Map<number, string>();
        const procesos = new Set<string>();

        (r ?? []).forEach(a => {
          if (a.pid_id != null) pads.set(a.pid_id, a.pad_name ?? String(a.pid_id));
          if (a.activity_id != null)
            actividades.set(a.activity_id, a.activity_code ?? String(a.activity_id));
          if (a.process_number != null) procesos.add(String(a.process_number));
        });

        this.pads = [...pads]
          .map(([id, pad]) => ({ id, pad }))
          .sort((x, y) => x.pad.localeCompare(y.pad));
        this.actividades = [...actividades]
          .map(([id, code]) => ({ id, code }))
          .sort((x, y) => x.code.localeCompare(y.code, undefined, { numeric: true }));
        this.listaProcesos = [...procesos].sort((x, y) => Number(x) - Number(y));
        this.cdr.detectChanges();
      },
      error: e => console.error(e),
    });
  }

  filtrarPorPad(id?: number | null) {
    if (id == null) return;
    this.id_pid = id;
    this.filtrarDatos(true);
  }

  filtrarPorActividad(id?: number | null) {
    if (id == null) return;
    this.id_actividad = id;
    this.filtrarDatos(true);
  }

  limpiarFiltros() {
    this.filtrobusqueda = '';
    this.id_pid = -1;
    this.id_actividad = -1;
    this.id_procesos = [];
    this.filtrarDatos(true);
  }

  // ---------- Mostrar / ocultar columnas ----------

  cargarColumnas() {
    try {
      const guardadas = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null');
      const validas = this.columnasDisponibles.map(c => c.key);
      this.columnasVisibles = Array.isArray(guardadas)
        ? guardadas.filter((k: string) => validas.includes(k))
        : [...this.columnasPorDefecto];
    } catch {
      this.columnasVisibles = [...this.columnasPorDefecto];
    }
    this.actualizarColumnas();
  }

  esVisible(key: string): boolean {
    return this.columnasVisibles.includes(key);
  }

  toggleColumna(key: string) {
    this.columnasVisibles = this.esVisible(key)
      ? this.columnasVisibles.filter(k => k !== key)
      : [...this.columnasVisibles, key];
    this.actualizarColumnas();
  }

  restablecerColumnas() {
    this.columnasVisibles = [...this.columnasRestablecer];
    this.actualizarColumnas();
  }

  actualizarColumnas() {
    const visibles = this.columnasDisponibles.filter(c => this.esVisible(c.key)).map(c => c.key);
    this.columnas = ['id', ...visibles];
    this.columnasTotalGeneral = this.columnas.map(k => `tg_${k}`);
    this.columnasSubtotal = this.columnas.map(k => `sp_${k}`);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.columnasVisibles));
    } catch (error) {
      console.warn('No se pudo guardar la configuración de columnas:', error);
    }
  }

  valor(
    row: AcquisitionsListSP,
    col: { tipo: string; campo?: keyof AcquisitionsListSP; decimales?: number }
  ): string {
    const v = col.campo ? row[col.campo] : null;
    if (col.tipo === 'moneda') return this.formatoMoneda(v, col.decimales);
    if (col.tipo === 'fecha') return this.formatoFecha(v);
    return v === null || v === undefined || v === '' ? '-' : String(v);
  }

  formatoMoneda(valor: unknown, decimales = 0): string {
    const n = Number(valor ?? 0) || 0;
    const [entero, dec] = Math.abs(n).toFixed(decimales).split('.');
    const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${n < 0 ? '-' : ''}$${miles}${dec ? ',' + dec : ''}`;
  }

  formatoFecha(valor: unknown): string {
    return valor ? String(valor).slice(0, 10).split('-').reverse().join('-') : '-';
  }
}
