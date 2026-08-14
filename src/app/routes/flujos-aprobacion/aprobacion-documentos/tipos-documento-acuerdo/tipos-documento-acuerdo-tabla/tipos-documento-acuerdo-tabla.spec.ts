import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposDocumentoAcuerdoTabla } from './tipos-documento-acuerdo-tabla';

describe('TiposDocumentoAcuerdoTabla', () => {
  let component: TiposDocumentoAcuerdoTabla;
  let fixture: ComponentFixture<TiposDocumentoAcuerdoTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposDocumentoAcuerdoTabla],
    }).compileComponents();

    fixture = TestBed.createComponent(TiposDocumentoAcuerdoTabla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
