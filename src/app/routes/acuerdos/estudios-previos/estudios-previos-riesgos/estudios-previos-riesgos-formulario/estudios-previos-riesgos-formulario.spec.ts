import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiosPreviosRiesgosFormulario } from './estudios-previos-riesgos-formulario';

describe('EstudiosPreviosRiesgosFormulario', () => {
  let component: EstudiosPreviosRiesgosFormulario;
  let fixture: ComponentFixture<EstudiosPreviosRiesgosFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiosPreviosRiesgosFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudiosPreviosRiesgosFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
