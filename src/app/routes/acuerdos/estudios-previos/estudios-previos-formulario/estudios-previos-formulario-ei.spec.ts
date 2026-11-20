import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MtxDrawer } from '@ng-matero/extensions/drawer';
import { PageHeader } from '@shared';
import { of } from 'rxjs';
import { EstudiosPreviosService } from 'src/app/services/estudios-previos/estudios-previos.service';
import { ImplementersService } from 'src/app/services/implementers/implementers.service';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';
import { ProgramsService } from 'src/app/services/programs.service';
import { EstudiosPreviosFormulario } from './estudios-previos-formulario';

@Component({ selector: 'page-header', template: '' })
class PageHeaderStub {}

describe('EstudiosPreviosFormulario - campos EI', () => {
  let estudios: jasmine.SpyObj<EstudiosPreviosService>;

  beforeEach(() => {
    estudios = jasmine.createSpyObj<EstudiosPreviosService>('estudios', [
      'saveEstPrevios',
      'updateEstPrevios',
      'getPorGuid',
      'getEstadosDesembolso',
    ]);
    estudios.getEstadosDesembolso.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [EstudiosPreviosFormulario],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: MtxDrawer, useValue: {} },
        { provide: EstudiosPreviosService, useValue: estudios },
        { provide: ImplementersService, useValue: { getImplementers: () => of([]) } },
        { provide: EvaluacionCapacidadesService, useValue: { getEvaCapacidades: () => of([]) } },
        { provide: ProgramsService, useValue: { getPrograms: () => of([]) } },
      ],
    }).overrideComponent(EstudiosPreviosFormulario, {
      remove: { imports: [PageHeader] },
      add: { imports: [PageHeaderStub] },
    });
  });

  it('enlaza contacto e integrantes EI y los envia al crear', async () => {
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const contact: HTMLTextAreaElement = fixture.nativeElement.querySelector('#contact_ei');
    const participants: HTMLTextAreaElement =
      fixture.nativeElement.querySelector('#participants_ei');
    expect(contact.labels![0].textContent).toContain('Contacto EI');
    expect(participants.labels![0].textContent).toContain('Integrantes EI');
    contact.value = 'Ana - ana@example.org';
    participants.value = 'Ana\nLuis';
    contact.dispatchEvent(new Event('input'));
    participants.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    estudios.saveEstPrevios.and.returnValue(of({ solicitud_exitosa: false, mensaje: 'Prueba' }));
    fixture.componentInstance.guardarEstudiosPrevios(false);
    expect(estudios.saveEstPrevios).toHaveBeenCalledWith(
      jasmine.objectContaining({
        contact_ei: 'Ana - ana@example.org',
        participants_ei: 'Ana\nLuis',
      })
    );
  });

  it('recupera los campos EI al editar y envia los cambios', async () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { params: { guid: 'estudio-prueba' } } },
    });
    estudios.getPorGuid.and.returnValue(
      of({ guid: 'estudio-prueba', contact_ei: 'Ana', participants_ei: 'Ana\nLuis' })
    );
    const fixture = TestBed.createComponent(EstudiosPreviosFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const contact: HTMLTextAreaElement = fixture.nativeElement.querySelector('#contact_ei');
    const participants: HTMLTextAreaElement =
      fixture.nativeElement.querySelector('#participants_ei');
    expect(contact.value).toBe('Ana');
    expect(participants.value).toBe('Ana\nLuis');
    contact.value = 'Nuevo contacto';
    participants.value = '';
    contact.dispatchEvent(new Event('input'));
    participants.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    estudios.updateEstPrevios.and.returnValue(of({ solicitud_exitosa: false, mensaje: 'Prueba' }));
    fixture.componentInstance.guardarEstudiosPrevios(false);
    expect(estudios.updateEstPrevios).toHaveBeenCalledWith(
      jasmine.objectContaining({ contact_ei: 'Nuevo contacto', participants_ei: '' })
    );
    expect(estudios.saveEstPrevios).not.toHaveBeenCalled();
  });
});
