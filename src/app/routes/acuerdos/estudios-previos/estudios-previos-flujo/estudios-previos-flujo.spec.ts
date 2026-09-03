import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiosPreviosFlujo } from './estudios-previos-flujo';

describe('EstudiosPreviosFlujo', () => {
  let component: EstudiosPreviosFlujo;
  let fixture: ComponentFixture<EstudiosPreviosFlujo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiosPreviosFlujo],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudiosPreviosFlujo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
