import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcuerdoFormulario } from './acuerdo-formulario';

describe('AcuerdoFormulario', () => {
  let component: AcuerdoFormulario;
  let fixture: ComponentFixture<AcuerdoFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcuerdoFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(AcuerdoFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
