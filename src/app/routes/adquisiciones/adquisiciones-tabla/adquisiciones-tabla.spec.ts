import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdquisicionesTabla } from './adquisiciones-tabla';

describe('AdquisicionesTabla', () => {
  let component: AdquisicionesTabla;
  let fixture: ComponentFixture<AdquisicionesTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdquisicionesTabla],
    }).compileComponents();

    fixture = TestBed.createComponent(AdquisicionesTabla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
