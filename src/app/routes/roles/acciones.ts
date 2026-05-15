import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '@shared';
import { AccesoControles } from 'src/app/models/acceso-controles';
import { AccesoModulos } from 'src/app/models/acceso-modulos';
import { ListaGenerica } from 'src/app/models/lista-generica';
import { Listados } from 'src/app/models/listados';
import { ResponseRequest } from 'src/app/models/response-request';
import { Roles } from 'src/app/models/roles';
import { RolesService } from 'src/app/services/roles.service';

@Component({
  selector: 'app-roles-acciones',
  templateUrl: './acciones.html',
  styleUrl: './acciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    UpperCasePipe,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
  ],
})
export class AccionesRoles implements OnInit {
  @ViewChild('fModulos') fModulosForm!: NgForm;

  private readonly rolesService = inject(RolesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  accion = 'Nuevo';
  idRol: number | null = null;
  isLoading = false;
  isLinear = true;
  columnas = ['posicion', 'modulo', 'descripcion', 'acciones'];

  listados: Listados[] = [];
  listaGenerica: ListaGenerica[] = [];
  controles: ListaGenerica[] = [];
  modulosAsignados: Set<number> = new Set();
  numero_modulos_asignados: number | null = null;

  accesoModulo: AccesoModulos = new AccesoModulos({
    id_modulo: null!,
    modulo: undefined,
    descripcion: undefined,
  });

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: null!,
    solicitud_exitosa: false,
  });

  rolData: Roles = new Roles({
    id_rol: null!,
    rol: '',
    descripcion: '',
    acceso_modulos: [],
    acceso_controles: [],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idRol = idParam ? Number(idParam) : null;
    this.accion = this.idRol ? 'Editar' : 'Nuevo';

    this.getListados();

    if (this.idRol) {
      this.rolesService.getRolById(this.idRol).subscribe({
        next: data => {
          this.rolData = new Roles(data);
          this.rolData.acceso_modulos = this.rolData.acceso_modulos ?? [];
          this.rolData.acceso_controles = this.rolData.acceso_controles ?? [];
          this.actualizarListaGenerica();
        },
        error: () => {
          this.snackBar.open('Error al cargar el rol', '', { duration: 3000 });
        },
      });
    }
  }

  getListados(): void {
    this.rolesService.getListados().subscribe({
      next: data => {
        this.listados = data;
        this.actualizarListaGenerica();
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los módulos', '', { duration: 3000 });
      },
    });
  }

  asignarModulo(): void {
    if (!this.accesoModulo.id_modulo) {
      return;
    }

    const modulo = this.listados[0]?.lista_generica?.find(x => x.identity === this.accesoModulo.id_modulo);
    if (!modulo) {
      return;
    }

    const existe = (this.rolData.acceso_modulos ?? []).some(x => x.id_modulo === this.accesoModulo.id_modulo);
    if (existe) {
      return;
    }

    const nuevo = new AccesoModulos({
      id_modulo: this.accesoModulo.id_modulo,
      modulo: modulo.valor,
      descripcion: modulo.valor_referencia,
      acceso_modulo: true,
    });

    this.rolData.acceso_modulos = [...(this.rolData.acceso_modulos ?? []), nuevo];
    this.accesoModulo = new AccesoModulos({
      id_modulo: null!,
      modulo: undefined,
      descripcion: undefined,
    });
    this.fModulosForm.resetForm();
    this.actualizarListaGenerica();
  }

  eliminarModulo(idModulo: number | undefined): void {
    if (!idModulo) {
      return;
    }

    this.rolData.acceso_modulos = (this.rolData.acceso_modulos ?? []).filter(x => x.id_modulo !== idModulo);
    this.actualizarListaGenerica();
  }

  actualizarListaGenerica(): void {
    this.modulosAsignados = new Set((this.rolData.acceso_modulos ?? []).map(x => Number(x.id_modulo)));
    this.numero_modulos_asignados = this.modulosAsignados.size === 0 ? null : this.modulosAsignados.size;

    const todosModulos = this.listados[0]?.lista_generica ?? [];
    this.listaGenerica = todosModulos.filter(item => !this.modulosAsignados.has(Number(item.identity)));

    this.controlesPorModulo();
  }

  controlesPorModulo(): void {
    const ids = Array.from(this.modulosAsignados);

    if (!ids.length) {
      this.controles = [];
      return;
    }

    this.rolesService.getControlesPorModulo(ids).subscribe({
      next: data => {
        this.controles = data[0]?.lista_generica ?? [];

        const selected = new Set((this.rolData.acceso_controles ?? []).map(x => x.id_control));
        this.controles = this.controles.map(control => {
          control.checked = selected.has(control.identity);
          return control;
        });
      },
      error: () => {
        this.controles = [];
      },
    });
  }

  controlesDeModulo(idModulo: number | undefined): ListaGenerica[] {
    if (!idModulo) {
      return [];
    }

    return this.controles.filter(control => control.idrelacion === idModulo);
  }

  guardarRol(): void {
    if (!this.rolData.rol || this.rolData.rol.trim().length === 0) {
      this.snackBar.open('El nombre del rol es obligatorio', '', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    this.rolData.acceso_controles = this.controles
      .filter(c => !!c.checked)
      .map(c => new AccesoControles({ id_control: c.identity }));

    const esNuevo = !this.rolData.id_rol || this.rolData.id_rol === 0;
    const request$ = esNuevo ? this.rolesService.saveRol(this.rolData) : this.rolesService.updateRol(this.rolData);

    request$.subscribe({
      next: response => {
        this.responseRequest = response;
        this.isLoading = false;

        if (response.solicitud_exitosa) {
          this.snackBar.open(esNuevo ? 'Rol creado correctamente' : 'Rol actualizado correctamente', '', {
            duration: 3000,
          });
          this.router.navigate(['/roles/listar']);
          return;
        }

        this.snackBar.open(response.mensaje || 'La operación no fue exitosa', '', { duration: 3000 });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open(esNuevo ? 'Error al crear el rol' : 'Error al actualizar el rol', '', {
          duration: 3000,
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/roles/listar']);
  }
}
