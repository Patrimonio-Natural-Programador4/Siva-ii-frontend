import { TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { MTX_DRAWER_DATA, MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { DesembolsosForm } from './desembolsos-form';
import { DesembolsoFormData } from 'src/app/models/desembolsos-estudio';

describe('DesembolsosForm', () => {
  const drawer = jasmine.createSpyObj<MtxDrawerRef<DesembolsosForm>>('drawer', ['dismiss']);
  const data: DesembolsoFormData = {
    estados: [{ id: 1, name: 'Programado' }],
    productos: [
      { key: 'new:temporal', nombre: 'P1 - Informe', usado: false },
      { key: 'id:2', nombre: 'P2 - Ya asociado', usado: true },
    ],
  };

  beforeEach(() => {
    delete data.desembolso;
    drawer.dismiss.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        { provide: MTX_DRAWER_DATA, useValue: data },
        { provide: MtxDrawerRef, useValue: drawer },
      ],
    });
  });

  it('precarga una copia para editar sin mutar el registro al cancelar', () => {
    data.desembolso = {
      id: 8,
      number_disbursement: 1,
      scheduled_date: '2026-11-01',
      value: '100.50',
      state_id: 1,
      product_keys: ['new:temporal'],
    };
    const component = TestBed.runInInjectionContext(() => new DesembolsosForm());
    expect(component.registro).toEqual(data.desembolso);
    component.registro.value = '200.25';
    component.seleccionar('new:temporal', false);
    component.cancelar();
    expect(data.desembolso.value).toBe('100.50');
    expect(data.desembolso.product_keys).toEqual(['new:temporal']);
    expect(drawer.dismiss).toHaveBeenCalledWith();
  });

  it('requiere productos y rechaza los ya asociados', () => {
    const component = TestBed.runInInjectionContext(() => new DesembolsosForm());
    component.registro = {
      number_disbursement: 1,
      scheduled_date: '2026-11-01',
      value: '100.50',
      state_id: 1,
      product_keys: [],
    };
    component.guardar(new NgForm([], []));
    expect(drawer.dismiss).not.toHaveBeenCalled();
    component.seleccionar('id:2', true);
    component.guardar(new NgForm([], []));
    expect(drawer.dismiss).not.toHaveBeenCalled();
    component.seleccionar('id:2', false);
    component.seleccionar('new:temporal', true);
    component.guardar(new NgForm([], []));
    expect(drawer.dismiss).toHaveBeenCalledWith(component.registro);
  });

  it('rechaza numeros fraccionarios de desembolso', () => {
    const component = TestBed.runInInjectionContext(() => new DesembolsosForm());
    component.registro = {
      number_disbursement: 1.5,
      scheduled_date: '2026-11-01',
      value: '100',
      state_id: 1,
      product_keys: ['new:temporal'],
    };
    component.guardar(new NgForm([], []));
    expect(drawer.dismiss).not.toHaveBeenCalled();
  });

  it('deshabilita productos usados y permite seleccionar productos nuevos en el drawer', async () => {
    const fixture = TestBed.createComponent(DesembolsosForm);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const checkboxes: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="checkbox"]')
    );
    expect(checkboxes[0].disabled).toBeFalse();
    expect(checkboxes[1].disabled).toBeTrue();
    checkboxes[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.registro.product_keys).toEqual(['new:temporal']);
    fixture.componentInstance.cancelar();
    expect(drawer.dismiss).toHaveBeenCalledWith();
  });
});
