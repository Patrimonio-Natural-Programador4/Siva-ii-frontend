import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MtxDrawer, MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { PageHeader } from '@shared';
import { of } from 'rxjs';
import { EstudiosPreviosService } from 'src/app/services/estudios-previos/estudios-previos.service';
import { ImplementersService } from 'src/app/services/implementers/implementers.service';
import { PersonsService } from 'src/app/services/personas.service';
import { CapacityAssessmentStateService } from 'src/app/services/CapacityAssessmentsStates.service';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { ProgramsService } from 'src/app/services/programs.service';
import { EstudiosPreviosFormulario } from './estudios-previos-formulario';
import { ProductosForm } from '../productos-form/productos-form';
import { ProductoEstudio } from 'src/app/models/agreements-products';
import { DesembolsosForm } from '../desembolsos-form/desembolsos-form';
import { DesembolsoEstudio } from 'src/app/models/desembolsos-estudio';

@Component({ selector: 'page-header', template: '' })
class PageHeaderStub {}

describe('EstudiosPreviosFormulario - productos', () => {
  const drawer = jasmine.createSpyObj<MtxDrawer>('drawer', ['open']);
  const estudios = jasmine.createSpyObj<EstudiosPreviosService>('estudios', [
    'saveEstPrevios',
    'getEstadosDesembolso',
  ]);

  function resultadoDrawer(
    registro?: ProductoEstudio
  ): MtxDrawerRef<ProductosForm, ProductoEstudio> {
    const ref = jasmine.createSpyObj<MtxDrawerRef<ProductosForm, ProductoEstudio>>('drawerRef', [
      'afterDismissed',
    ]);
    ref.afterDismissed.and.returnValue(of(registro));
    return ref;
  }

  beforeEach(() => {
    drawer.open.calls.reset();
    estudios.saveEstPrevios.calls.reset();
    estudios.getEstadosDesembolso.and.returnValue(of([{ id: 1, name: 'Programado' }]));
    TestBed.configureTestingModule({
      imports: [EstudiosPreviosFormulario],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: MtxDrawer, useValue: drawer },
        { provide: EstudiosPreviosService, useValue: estudios },
        { provide: ImplementersService, useValue: { getImplementers: () => of([]) } },
        { provide: PersonsService, useValue: { getPersons: () => of([]) } },
        { provide: CapacityAssessmentStateService, useValue: { getCapStates: () => of([]) } },
        { provide: EvaluacionCapacidadesService, useValue: { getEvaCapacidades: () => of([]) } },
        { provide: ProgramsService, useValue: { getPrograms: () => of([]) } },
      ],
    }).overrideComponent(EstudiosPreviosFormulario, {
      remove: { imports: [PageHeader] },
      add: { imports: [PageHeaderStub] },
    });
  });

  it('abre el drawer, agrega los tres niveles a la tabla y solo envia al guardar', async () => {
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const headers: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('mat-step-header')
    );
    expect(headers.length).toBe(5);
    expect(headers[4].textContent).toContain('Desembolsos');
    expect(headers[3].textContent).toContain('Objetivos, Actividades y Productos');
    headers[3].click();
    fixture.detectChanges();
    drawer.open.and.returnValues(
      resultadoDrawer({ code: '', product: 'Objetivo A' }),
      resultadoDrawer({ code: '1.1', product: 'Actividad A' }),
      resultadoDrawer({
        code: 'P1',
        product: 'Producto A',
        unit_measure: 'Informes',
        quantity: '2.50',
        observations: 'Entrega',
        state_id: 1,
      })
    );
    component.agregarObjetivo();
    const objetivo = component.estuPreviosData.objetivos![0];
    component.agregarActividad(objetivo);
    component.agregarProducto(objetivo.actividades[0]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Producto A');
    expect(fixture.nativeElement.querySelectorAll('.products-tree__objective').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.products-tree__activity').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.products-tree__product').length).toBe(1);
    const objectiveRow: HTMLTableRowElement = fixture.nativeElement.querySelector(
      '.products-tree__objective'
    );
    const activityRow: HTMLTableRowElement = fixture.nativeElement.querySelector(
      '.products-tree__activity'
    );
    expect(objectiveRow.cells[1].colSpan).toBe(4);
    expect(activityRow.cells[1].colSpan).toBe(4);
    expect(objectiveRow.textContent).toContain('OBJ');
    expect(activityRow.textContent).toContain('ACT');
    expect(fixture.nativeElement.querySelector('.products-tree__product').textContent).toContain(
      'PRO'
    );
    const branches: HTMLDetailsElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.products-tree details')
    );
    expect(branches.length).toBe(2);
    expect(branches.every(branch => !branch.open)).toBeTrue();
    branches[0].querySelector('summary')!.click();
    expect(branches[0].open).toBeTrue();
    expect(branches[1].open).toBeFalse();
    branches[1].querySelector('summary')!.click();
    expect(branches[1].open).toBeTrue();
    branches[0].querySelector('summary')!.click();
    expect(branches[0].open).toBeFalse();
    const addActivity: HTMLButtonElement = objectiveRow.querySelector('button')!;
    expect(addActivity.getAttribute('aria-label')).toContain('Agregar actividad');
    expect(addActivity.querySelector('mat-icon')!.textContent).toBe('add_circle');
    expect<unknown>(drawer.open.calls.first().args[0]).toBe(ProductosForm);
    expect(estudios.saveEstPrevios).not.toHaveBeenCalled();
    estudios.saveEstPrevios.and.returnValue(of({ solicitud_exitosa: false, mensaje: 'Prueba' }));
    component.guardarEstudiosPrevios(false);
    expect(estudios.saveEstPrevios.calls.mostRecent().args[0].objetivos![0]).toEqual(objetivo);
    expect(objetivo.actividades[0].productos[0].state_id).toBe(1);
  });

  it('edita objetivos y actividades conservando hijos e identidad y no aplica al cancelar', async () => {
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.estuPreviosData.objetivos = [
      {
        id: 1,
        code: '1',
        product: 'Objetivo',
        actividades: [
          {
            id: 2,
            code: 'A1',
            product: 'Actividad',
            productos: [
              {
                id: 3,
                code: 'P1',
                product: 'Producto',
                state_id: 5,
              },
            ],
          },
        ],
      },
    ];
    fixture.detectChanges();
    const objetivo = component.estuPreviosData.objetivos[0];
    const actividad = objetivo.actividades[0];
    const productos = actividad.productos;
    drawer.open.and.returnValues(
      resultadoDrawer({ code: '', product: 'Objetivo editado' }),
      resultadoDrawer({ code: 'A2', product: 'Actividad editada' }),
      resultadoDrawer()
    );
    const editarObjetivo: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[aria-label="Editar objetivo 1"]'
    );
    editarObjetivo.click();
    const editarActividad: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[aria-label="Editar actividad A1"]'
    );
    editarActividad.click();
    expect(objetivo.product).toBe('Objetivo editado');
    expect(objetivo.code).toBe('1');
    expect(objetivo.id).toBe(1);
    expect(objetivo.modificar).toBeTrue();
    expect(actividad.code).toBe('A2');
    expect(actividad.product).toBe('Actividad editada');
    expect(actividad.id).toBe(2);
    expect(actividad.modificar).toBeTrue();
    expect(actividad.productos).toBe(productos);
    component.editarObjetivo(objetivo);
    expect(objetivo.product).toBe('Objetivo editado');
    expect(estudios.saveEstPrevios).not.toHaveBeenCalled();
    for (const wrapper of fixture.nativeElement.querySelectorAll(
      '.products-panel, .products-panel .table-responsive, .disbursements-panel, .disbursements-panel .table-responsive'
    )) {
      expect(getComputedStyle(wrapper).overflowY).toBe('hidden');
      expect(getComputedStyle(wrapper).maxHeight).toBe('none');
    }
  });

  it('edita productos sin cambiar su identidad, estado o referencia temporal', async () => {
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.estuPreviosData.objetivos = [
      {
        code: '1',
        product: 'Objetivo',
        actividades: [
          {
            code: 'A1',
            product: 'Actividad',
            productos: [
              {
                id: 3,
                client_id: 'temporal',
                code: 'P1',
                product: 'Producto',
                unit_measure: 'Informe',
                quantity: '1',
                state_id: 5,
              },
            ],
          },
        ],
      },
    ];
    fixture.detectChanges();
    drawer.open.and.returnValue(
      resultadoDrawer({
        code: 'P2',
        product: 'Editado',
        unit_measure: 'Documento',
        quantity: '3.75',
        observations: 'Cambio',
        state_id: 1,
      })
    );
    const editar: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[aria-label="Editar producto P1"]'
    );
    editar.click();
    const producto = component.estuPreviosData.objetivos[0].actividades[0].productos[0];
    expect(producto).toEqual(
      jasmine.objectContaining({
        id: 3,
        client_id: 'temporal',
        code: 'P2',
        product: 'Editado',
        quantity: '3.75',
        state_id: 5,
        modificar: true,
      })
    );
    expect(drawer.open.calls.mostRecent().args[1]?.data).toEqual(
      jasmine.objectContaining({ codigosExistentes: [] })
    );
    expect(estudios.saveEstPrevios).not.toHaveBeenCalled();
  });

  it('cancelar el drawer no agrega filas', () => {
    drawer.open.and.returnValue(resultadoDrawer());
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.componentInstance.agregarObjetivo();
    expect(fixture.componentInstance.estuPreviosData.objetivos).toEqual([]);
    expect(estudios.saveEstPrevios).not.toHaveBeenCalled();
  });

  it('asocia un producto temporal y muestra el desembolso sin guardar en el servidor', async () => {
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.estuPreviosData.objetivos = [
      {
        code: '1',
        product: 'Objetivo',
        actividades: [
          {
            code: '1.1',
            product: 'Actividad',
            productos: [
              {
                client_id: 'temporal',
                code: 'P1',
                product: 'Informe',
                unit_measure: 'Documento',
                quantity: '2.50',
                observations: 'Entrega parcial',
              },
            ],
          },
        ],
      },
    ];
    const registro: DesembolsoEstudio = {
      number_disbursement: 1,
      scheduled_date: '2026-11-01',
      value: '100.50',
      state_id: 1,
      product_keys: ['new:temporal'],
    };
    const ref = jasmine.createSpyObj<MtxDrawerRef<DesembolsosForm, DesembolsoEstudio>>(
      'drawerDesembolso',
      ['afterDismissed']
    );
    ref.afterDismissed.and.returnValue(of(registro));
    drawer.open.and.returnValue(ref);
    component.agregarDesembolso();
    fixture.detectChanges();
    expect(component.estuPreviosData.desembolsos).toEqual([registro]);
    expect(fixture.nativeElement.querySelector('.disbursement-row').textContent).toContain(
      '1 producto(s)'
    );
    expect(fixture.nativeElement.querySelector('.disbursement-row').textContent).not.toContain(
      'P1'
    );
    const branch: HTMLDetailsElement = fixture.nativeElement.querySelector(
      '.disbursements-tree__branch details'
    );
    expect(branch.open).toBeFalse();
    expect(branch.querySelector('summary')!.textContent).toContain('Ver productos asociados (1)');
    branch.querySelector('summary')!.click();
    expect(branch.open).toBeTrue();
    const productRow = branch.querySelector('.disbursements-tree__product')!;
    for (const text of ['P1', 'Informe', 'Documento', '2.50', 'Entrega parcial']) {
      expect(productRow.textContent).toContain(text);
    }
    branch.querySelector('summary')!.click();
    expect(branch.open).toBeFalse();
    expect(component.nombreEstadoDesembolso(registro.state_id)).toBe('Programado');
    expect(estudios.saveEstPrevios).not.toHaveBeenCalled();
    expect(drawer.open.calls.mostRecent().args[1]?.data).toEqual(
      jasmine.objectContaining({
        productos: [jasmine.objectContaining({ key: 'new:temporal', usado: false })],
      })
    );
    component.agregarDesembolso();
    expect(drawer.open.calls.mostRecent().args[1]?.data).toEqual(
      jasmine.objectContaining({
        productos: [jasmine.objectContaining({ key: 'new:temporal', usado: true })],
      })
    );
  });

  it('desglosa solo los productos de cada desembolso y conserva cantidades cero', async () => {
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.estuPreviosData.objetivos = [
      {
        code: '1',
        product: 'Objetivo',
        actividades: [
          {
            code: 'A1',
            product: 'Actividad',
            productos: [
              { id: 10, code: 'P10', product: 'Producto guardado', quantity: 0 },
              { client_id: 'nuevo', code: 'P20', product: 'Producto nuevo' },
            ],
          },
        ],
      },
    ];
    const base = { number_disbursement: 1, scheduled_date: null, value: 0, state_id: 1 };
    component.estuPreviosData.desembolsos = [
      { ...base, product_keys: ['id:10', 'new:nuevo'] },
      { ...base, number_disbursement: 2, product_keys: ['id:99'] },
      { ...base, number_disbursement: 3, product_keys: [] },
    ];
    fixture.detectChanges();
    const rows: HTMLTableRowElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.disbursement-row')
    );
    expect(rows.map(row => row.cells[3].textContent!.trim())).toEqual([
      '2 producto(s)',
      '1 producto(s)',
      '0 producto(s)',
    ]);
    const branches: HTMLTableRowElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.disbursements-tree__branch')
    );
    expect(branches.length).toBe(2);
    expect(branches[0].cells[0].colSpan).toBe(6);
    const products = branches[0].querySelectorAll<HTMLTableRowElement>(
      '.disbursements-tree__product'
    );
    expect(products.length).toBe(2);
    expect(products[0].textContent).toContain('Producto guardado');
    expect(products[0].cells[3].textContent).toBe('0');
    expect(products[1].textContent).toContain('Producto nuevo');
    expect(branches[1].textContent).toContain('No se encontró el producto asociado: id:99');
    expect(branches[1].textContent).not.toContain('Producto guardado');
    expect(estudios.saveEstPrevios).not.toHaveBeenCalled();
  });

  it('edita sin duplicar, actualiza el total y mantiene los cambios locales hasta guardar', async () => {
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const original: DesembolsoEstudio = {
      id: 8,
      number_disbursement: 1,
      scheduled_date: '2026-11-01',
      value: '0.10',
      state_id: 1,
      product_keys: ['id:10'],
    };
    const otro: DesembolsoEstudio = {
      ...original,
      id: 9,
      number_disbursement: 2,
      value: '0.20',
      product_keys: ['id:20'],
    };
    component.estuPreviosData.objetivos = [
      {
        code: '1',
        product: 'Objetivo',
        actividades: [
          {
            code: 'A1',
            product: 'Actividad',
            productos: [
              { id: 10, code: 'P1', product: 'Propio' },
              { id: 20, code: 'P2', product: 'Otro' },
            ],
          },
        ],
      },
    ];
    component.estuPreviosData.desembolsos = [original, otro];
    expect(component.totalDesembolsos).toBe(0.3);
    const editado = { ...original, value: '10.35' };
    const ref = jasmine.createSpyObj<MtxDrawerRef<DesembolsosForm, DesembolsoEstudio>>(
      'editarDrawer',
      ['afterDismissed']
    );
    ref.afterDismissed.and.returnValue(of(editado));
    drawer.open.and.returnValue(ref);
    fixture.detectChanges();
    const edit: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[aria-label="Editar desembolso 1"]'
    );
    edit.click();
    fixture.detectChanges();
    expect(component.estuPreviosData.desembolsos).toEqual([editado, otro]);
    expect(component.totalDesembolsos).toBe(10.55);
    expect(fixture.nativeElement.querySelector('.disbursements-tree tfoot').textContent).toContain(
      '10.55'
    );
    expect(drawer.open.calls.mostRecent().args[1]?.data).toEqual(
      jasmine.objectContaining({
        desembolso: original,
        productos: [
          jasmine.objectContaining({ key: 'id:10', usado: false }),
          jasmine.objectContaining({ key: 'id:20', usado: true }),
        ],
      })
    );
    ref.afterDismissed.and.returnValue(of(undefined));
    component.agregarDesembolso(editado);
    expect(component.estuPreviosData.desembolsos).toEqual([editado, otro]);
    expect(estudios.saveEstPrevios).not.toHaveBeenCalled();
  });
});
