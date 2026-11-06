import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccionAprobacion, DialogData } from './accion-aprobacion';

describe('AccionAprobacion role assignments', () => {
  let fixture: ComponentFixture<AccionAprobacion>;
  let data: DialogData;
  let close: jasmine.Spy;

  beforeEach(async () => {
    data = {
      titulo: 'Aprobar evaluacion',
      tipoAccion: 'APROBAR',
      roles_disponibles_asignar: [
        {
          rol: 'PUNTO FOCAL UER',
          rol_id: 16,
          users: [
            { user_id: 117, name: 'Usuario A', email: 'a@example.com' },
            { user_id: 82, name: 'Usuario B' },
          ],
        },
        {
          rol: 'REVISOR',
          rol_id: 20,
          users: [
            { user_id: 86, name: 'Usuario C' },
            { user_id: 90, name: 'Usuario D' },
          ],
        },
      ],
    };
    close = jasmine.createSpy('close');
    await TestBed.configureTestingModule({
      imports: [AccionAprobacion],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();
  });

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(AccionAprobacion);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('renders one row per role and saves independently selected users', async () => {
    await render();
    const element: HTMLElement = fixture.nativeElement;
    expect(
      Array.from(element.querySelectorAll('th')).map(cell => cell.textContent?.trim())
    ).toEqual(['Rol', 'Asignar usuario']);
    const rows = element.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('td')?.textContent?.trim()).toBe('PUNTO FOCAL UER');
    const selects = element.querySelectorAll<HTMLSelectElement>('tbody select');
    expect(selects[0].options.length).toBe(3);
    expect(selects[1].options.length).toBe(3);
    selects[0].selectedIndex = 2;
    selects[0].dispatchEvent(new Event('change'));
    selects[1].selectedIndex = 1;
    selects[1].dispatchEvent(new Event('change'));
    fixture.componentInstance.onSave();
    expect(close).toHaveBeenCalledWith(
      jasmine.objectContaining({
        roles_asignados: [
          { rol: 'PUNTO FOCAL UER', rol_id: 16, users: [{ user_id: 82, name: 'Usuario B' }] },
          { rol: 'REVISOR', rol_id: 20, users: [{ user_id: 86, name: 'Usuario C' }] },
        ],
      })
    );
  });

  it('restores existing selections without mutating them on cancellation', async () => {
    data.roles_asignados = [
      { rol: 'PUNTO FOCAL UER', rol_id: 16, users: [{ user_id: 117, name: 'Usuario A' }] },
    ];
    await render();
    expect(fixture.componentInstance.usuariosAsignados).toEqual([117, null]);
    fixture.componentInstance.usuariosAsignados[0] = 82;
    fixture.componentInstance.onCancel();
    expect(close).toHaveBeenCalledWith();
    expect(data.roles_asignados[0].users[0].user_id).toBe(117);
  });

  it('only returns selected roles and omits user email', async () => {
    await render();
    fixture.componentInstance.usuariosAsignados[0] = 117;
    fixture.componentInstance.onSave();
    expect(close).toHaveBeenCalledWith(
      jasmine.objectContaining({
        roles_asignados: [
          { rol: 'PUNTO FOCAL UER', rol_id: 16, users: [{ user_id: 117, name: 'Usuario A' }] },
        ],
      })
    );
  });

  it('disables a role with no users and clears unavailable previous selections', async () => {
    data.roles_disponibles_asignar = [{ rol: 'REVISOR', rol_id: 20, users: [] }];
    data.roles_asignados = [
      { rol: 'REVISOR', rol_id: 20, users: [{ user_id: 86, name: 'Usuario C' }] },
    ];
    await render();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('select')?.disabled).toBeTrue();
    expect(fixture.componentInstance.usuariosAsignados).toEqual([null]);
    fixture.componentInstance.onSave();
    expect(close).toHaveBeenCalledWith(jasmine.objectContaining({ roles_asignados: [] }));
  });

  it('preserves adjustment behavior for callers without role assignment data', async () => {
    data.tipoAccion = 'AJUSTAR';
    delete data.roles_disponibles_asignar;
    await render();
    fixture.componentInstance.usuarios_disponibles = [
      { id_rol_aprobacion_ajuste: 5, id_usuario_ajuste: 82, usuario: 'Usuario B' },
    ];
    fixture.componentInstance.id_rol_aprobacion_ajuste = 5;
    fixture.componentInstance.onSave();
    expect(close).toHaveBeenCalledWith({
      tipoAccion: 'AJUSTAR',
      comentarios: '',
      id_usuario_ajuste: 82,
      id_rol_aprobacion_ajuste: 5,
    });
  });

  it('returns a null adjustment user when no role matches', async () => {
    data.tipoAccion = 'AJUSTAR';
    await render();
    fixture.componentInstance.id_rol_aprobacion_ajuste = 5;
    fixture.componentInstance.onSave();
    expect(close).toHaveBeenCalledWith(
      jasmine.objectContaining({ id_usuario_ajuste: null, id_rol_aprobacion_ajuste: 5 })
    );
  });

  const respuestasSinRoles: DialogData['roles_disponibles_asignar'][] = [[], '[]', null];
  for (const roles of respuestasSinRoles) {
    it(`opens and saves without a role table when the API returns ${JSON.stringify(roles)}`, async () => {
      data.roles_disponibles_asignar = roles;
      await render();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('table')).toBeNull();
      expect(fixture.componentInstance.rolesDisponiblesAsignar).toEqual([]);
      expect(fixture.componentInstance.usuariosAsignados).toEqual([]);
      fixture.componentInstance.comentarios = 'Sin asignaciones';
      fixture.componentInstance.onSave();
      expect(close).toHaveBeenCalledWith(
        jasmine.objectContaining({ tipoAccion: 'APROBAR', comentarios: 'Sin asignaciones' })
      );
      if (roles !== null) {
        expect(close).toHaveBeenCalledWith(jasmine.objectContaining({ roles_asignados: [] }));
      }
    });
  }
});
