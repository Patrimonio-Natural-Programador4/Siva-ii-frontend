import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoDocumentosAsociados } from './estado-documentos-asociados';

describe('EstadoDocumentosAsociados', () => {
  let component: EstadoDocumentosAsociados;
  let fixture: ComponentFixture<EstadoDocumentosAsociados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoDocumentosAsociados],
    }).compileComponents();

    fixture = TestBed.createComponent(EstadoDocumentosAsociados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
