import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiosPreviosRiesgosTabla } from './estudios-previos-riesgos-tabla';

describe('EstudiosPreviosRiesgosTabla', () => {
  let component: EstudiosPreviosRiesgosTabla;
  let fixture: ComponentFixture<EstudiosPreviosRiesgosTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiosPreviosRiesgosTabla],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudiosPreviosRiesgosTabla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
