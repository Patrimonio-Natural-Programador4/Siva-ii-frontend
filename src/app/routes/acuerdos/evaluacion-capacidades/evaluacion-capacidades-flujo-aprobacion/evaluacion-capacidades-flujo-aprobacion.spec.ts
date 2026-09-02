import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionCapacidadesFlujoAprobacion } from './evaluacion-capacidades-flujo-aprobacion';

describe('EvaluacionCapacidadesFlujoAprobacion', () => {
  let component: EvaluacionCapacidadesFlujoAprobacion;
  let fixture: ComponentFixture<EvaluacionCapacidadesFlujoAprobacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionCapacidadesFlujoAprobacion],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluacionCapacidadesFlujoAprobacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
