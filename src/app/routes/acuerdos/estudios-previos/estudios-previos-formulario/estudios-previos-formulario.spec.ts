import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiosPreviosFormulario } from './estudios-previos-formulario';

describe('EstudiosPreviosFormulario', () => {
  let component: EstudiosPreviosFormulario;
  let fixture: ComponentFixture<EstudiosPreviosFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiosPreviosFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
