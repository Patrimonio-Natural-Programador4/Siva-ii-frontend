import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuService } from '@core';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UsuariosService } from 'src/app/services/usuarios.service';

import { Listar } from './listar';

describe('Listar', () => {
  let component: Listar;
  let fixture: ComponentFixture<Listar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listar],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        MenuService,
        {
          provide: UsuariosService,
          useValue: {
            getUsuarios: () => of([
              {
                guid: 'user-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                other_name: '',
                other_last_name: '',
                email: 'ada@example.com',
                position: 'Analyst',
              },
              {
                guid: 'user-2',
                first_name: 'Grace',
                last_name: 'Hopper',
                other_name: '',
                other_last_name: '',
                email: 'grace@example.com',
                position: 'Engineer',
              },
            ]),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render usuarios in the material table', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Ada Lovelace');
    expect(content).toContain('GRACE@EXAMPLE.COM');
  });

  it('should filter usuarios by search term', () => {
    component.buscarUsuarios({ target: { value: 'grace' } } as unknown as Event);

    expect(component.usuariosTable.filteredData).toHaveSize(1);
    expect(component.usuariosTable.filteredData[0].email).toBe('grace@example.com');
  });

  it('should configure paginator to show 20 items per page', () => {
    expect(component.pageSizeOptions).toEqual([20]);
  });
});
