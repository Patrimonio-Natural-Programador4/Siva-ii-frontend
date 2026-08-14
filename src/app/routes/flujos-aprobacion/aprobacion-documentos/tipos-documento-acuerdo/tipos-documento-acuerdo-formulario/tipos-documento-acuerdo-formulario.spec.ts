import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposDocumentoAcuerdoFormulario } from './tipos-documento-acuerdo-formulario';

describe('TiposDocumentoAcuerdoFormulario', () => {
  let component: TiposDocumentoAcuerdoFormulario;
  let fixture: ComponentFixture<TiposDocumentoAcuerdoFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposDocumentoAcuerdoFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(TiposDocumentoAcuerdoFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
