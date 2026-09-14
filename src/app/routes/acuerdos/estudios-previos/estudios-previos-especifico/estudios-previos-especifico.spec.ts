import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiosPreviosEspecifico } from './estudios-previos-especifico';

describe('EstudiosPreviosEspecifico', () => {
  let component: EstudiosPreviosEspecifico;
  let fixture: ComponentFixture<EstudiosPreviosEspecifico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiosPreviosEspecifico],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudiosPreviosEspecifico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
