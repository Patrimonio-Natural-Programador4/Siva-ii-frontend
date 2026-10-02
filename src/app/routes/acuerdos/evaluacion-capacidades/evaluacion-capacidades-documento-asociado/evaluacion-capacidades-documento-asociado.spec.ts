import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionCapacidadesDocumentoAsociado } from './evaluacion-capacidades-documento-asociado';

describe('EvaluacionCapacidadesDocumentoAsociado', () => {
  let component: EvaluacionCapacidadesDocumentoAsociado;
  let fixture: ComponentFixture<EvaluacionCapacidadesDocumentoAsociado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionCapacidadesDocumentoAsociado],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluacionCapacidadesDocumentoAsociado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
