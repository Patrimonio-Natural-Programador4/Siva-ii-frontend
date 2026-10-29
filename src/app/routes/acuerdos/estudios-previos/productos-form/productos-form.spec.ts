import { TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { MTX_DRAWER_DATA, MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { ProductosFormData } from 'src/app/models/agreements-products';
import { ProductosForm } from './productos-form';

describe('ProductosForm', () => {
  const drawer = jasmine.createSpyObj<MtxDrawerRef<ProductosForm>>('drawer', ['dismiss']);

  function crear(data: ProductosFormData): ProductosForm {
    TestBed.configureTestingModule({
      providers: [
        { provide: MTX_DRAWER_DATA, useValue: data },
        { provide: MtxDrawerRef, useValue: drawer },
      ],
    });
    return TestBed.runInInjectionContext(() => new ProductosForm());
  }

  beforeEach(() => drawer.dismiss.calls.reset());

  it('agrega el objetivo sin persistir y recorta espacios', () => {
    const component = crear({ tipo: 'objetivo' });
    component.registro.product = ' Objetivo ';
    component.guardar(new NgForm([], []));
    expect(drawer.dismiss).toHaveBeenCalledWith({ code: '', product: 'Objetivo' });
  });

  it('rechaza nombres que solo contienen espacios', () => {
    const component = crear({ tipo: 'objetivo' });
    component.registro.product = ' ';
    component.guardar(new NgForm([], []));
    expect(drawer.dismiss).not.toHaveBeenCalled();
    expect(component.error).toBeTruthy();
  });

  it('crea el producto con estado inicial 1 y todos sus datos', () => {
    const component = crear({ tipo: 'producto' });
    component.registro = {
      code: ' P1 ',
      product: ' Informe ',
      unit_measure: ' Documentos ',
      quantity: '2.50',
      observations: ' Entrega ',
    };
    component.guardar(new NgForm([], []));
    expect(drawer.dismiss).toHaveBeenCalledWith({
      code: 'P1',
      product: 'Informe',
      unit_measure: 'Documentos',
      quantity: '2.50',
      observations: 'Entrega',
      state_id: 1,
    });
  });

  it('rechaza codigos de productos duplicados bajo la misma actividad', () => {
    const component = crear({ tipo: 'producto', codigosExistentes: ['P1'] });
    component.registro = { code: 'P1', product: 'Informe', unit_measure: 'Unidad', quantity: '1' };
    component.guardar(new NgForm([], []));
    expect(drawer.dismiss).not.toHaveBeenCalled();
    expect(component.error).toContain('ya existe');
  });

  it('cancelar no devuelve registros al formulario', () => {
    crear({ tipo: 'actividad' }).cancelar();
    expect(drawer.dismiss).toHaveBeenCalledWith();
  });

  it('valida cantidad y campos requeridos en el formulario renderizado', async () => {
    crear({ tipo: 'producto' });
    const fixture = TestBed.createComponent(ProductosForm);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#producto-cantidad');
    const boton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(boton.disabled).toBeTrue();
    fixture.componentInstance.registro = {
      code: 'P1',
      product: 'Informe',
      unit_measure: 'Unidad',
      quantity: '2.50',
    };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(boton.disabled).toBeFalse();
    for (const invalido of ['-1', '1.001', 'texto']) {
      input.value = invalido;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(boton.disabled).withContext(invalido).toBeTrue();
    }
  });
});
