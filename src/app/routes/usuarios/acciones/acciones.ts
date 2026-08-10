import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageHeader } from '@shared';
import { Programs } from 'src/app/models/programs';
import { ResponseRequest } from 'src/app/models/response-request';
import { Roles } from 'src/app/models/roles';
import { Usuarios } from 'src/app/models/usuarios';
import { ProgramsService } from 'src/app/services/programs.service';
import { RolesService } from 'src/app/services/roles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-usuarios-acciones',
  templateUrl: './acciones.html',
  styleUrl: './acciones.scss',
  imports: [
    PageHeader,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
  ],
})
export class Acciones implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly programsService = inject(ProgramsService);
  private readonly rolesService = inject(RolesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly modelTypeHint = 'App\\Models\\User';

  accion = 'Editar';
  isLinear = true;
  isLoading = false;
  asignarTodosProgramas = false;
  userGuid = '';
  idRolSeleccionado: number | null = null;
  readonly columnasRoles = ['numero', 'rol', 'descripcion', 'acciones'];

  usuarioData: Usuarios = new Usuarios({
    first_name: '',
    other_name: '',
    last_name: '',
    other_last_name: '',
    identification_type: 1,
    identification_number: null!,
    email: '',
    position: '',
    is_active: true,
    program_ids: [],
    role_ids: [],
  });

  programasCatalogo: Programs[] = [];
  rolesCatalogo: Roles[] = [];

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: null!,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    this.userGuid = this.activatedRoute.snapshot.params['id'] ?? '';
    if (this.userGuid) {
      // this.snackBar.open('No se recibió el identificador del usuario', '', { duration: 3000 });
      // this.volver();
      // return;
      this.getUsuario();
    }
    this.getProgramas();
    this.getRoles();


  //   forkJoin({
  //     usuario: this.usuariosService.getUsuarioById(this.userGuid),
  //     programas: this.programsService.getPrograms(),
  //     roles: this.rolesService.getRoles(),
  //   }).subscribe({
  //     next: ({ usuario, programas, roles }) => {
  //       this.usuarioData = new Usuarios({
  //         ...usuario,
  //         program_ids: usuario.program_ids ?? [],
  //         role_ids: usuario.role_ids ?? [],
  //       });
  //       this.programasCatalogo = programas ?? [];
  //       this.rolesCatalogo = roles ?? [];
  //       this.sincronizarAsignarTodosProgramas();
  //     },
  //     error: () => {
  //       this.snackBar.open('Error al cargar la información del usuario', '', { duration: 3000 });
  //       this.volver();
  //     },
  //   });
  }

  private getProgramas(): void {
    this.programsService.getPrograms().subscribe({
      next: (programas) => {
        this.programasCatalogo = programas ?? [];
        this.sincronizarAsignarTodosProgramas();
      },
      error: () => {
        this.snackBar.open('Error al cargar los programas', '', { duration: 3000 });
      }
    });
  }

  private getRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.rolesCatalogo = roles ?? [];
      },
      error: () => {
        this.snackBar.open('Error al cargar los roles', '', { duration: 3000 });
      }
    });
  }

   private getUsuario(): void {
    this.isLoading = true;
    this.usuariosService.getUsuarioById(this.userGuid).subscribe({
      next: (usuario) => {
        this.usuarioData = new Usuarios({
          ...usuario,
          program_ids: usuario.program_ids ?? [],
          role_ids: usuario.role_ids ?? [],
        });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar el usuario', '', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  onAsignarTodosProgramasChange(event: MatCheckboxChange): void {
    const checked = !!event.checked;
    this.asignarTodosProgramas = checked;

    if (checked) {
      this.usuarioData.program_ids = this.programasCatalogo
        .map(p => p.id_programa)
        .filter((id): id is number => id !== undefined && id !== null);
      return;
    }

    this.usuarioData.program_ids = [];
  }

  onProgramaChange(idPrograma: number, event: MatCheckboxChange): void {
    const set = new Set(this.usuarioData.program_ids ?? []);

    if (event.checked) {
      set.add(idPrograma);
    } else {
      set.delete(idPrograma);
    }

    this.usuarioData.program_ids = Array.from(set);
    this.sincronizarAsignarTodosProgramas();
  }

  isProgramaSeleccionado(idPrograma: number | undefined): boolean {
    if (!idPrograma) {
      return false;
    }
    return (this.usuarioData.program_ids ?? []).includes(idPrograma);
  }

  get rolesAsignados(): Roles[] {
    const ids = new Set(this.usuarioData.role_ids ?? []);
    return this.rolesCatalogo.filter(rol => !!rol.id_rol && ids.has(rol.id_rol));
  }

  get rolesDisponibles(): Roles[] {
    const ids = new Set(this.usuarioData.role_ids ?? []);
    return this.rolesCatalogo.filter(rol => !!rol.id_rol && !ids.has(rol.id_rol));
  }

  asignarRol(): void {
    if (!this.idRolSeleccionado) {
      return;
    }

    const ids = new Set(this.usuarioData.role_ids ?? []);
    ids.add(this.idRolSeleccionado);
    this.usuarioData.role_ids = Array.from(ids);
    this.idRolSeleccionado = null;
  }

  eliminarRol(idRol: number | undefined): void {
    if (!idRol) {
      return;
    }

    this.usuarioData.role_ids = (this.usuarioData.role_ids ?? []).filter(id => id !== idRol);
  }

  guardarUsuario(): void {
    if (this.usuarioData.email && this.usuarioData.email.trim().toLowerCase().endsWith('@fcds.org.co') && (this.usuarioData.id == 0 || this.usuarioData.id == null)) {
      // this.toastr.error('No se permiten correos asociados a la fundación', 'Error', {
      //   timeOut: 3000, positionClass: 'toast-top-center',
      // });
      this.snackBar.open('No se permiten correos asociados a patrimonio', '', { duration: 3000 });
      return;
    }

    this.isLoading = true; //  Mostrar spinner o deshabilitar botón
    this.usuarioData.is_guest = this.usuarioData.id == 0 || this.usuarioData.id == null ? true : this.usuarioData.is_guest;
    const esNuevo = !this.usuarioData.guid;
    const request$ = esNuevo
      ? this.usuariosService.crearUsuario(this.usuarioData)
      : this.usuariosService.actualizarUsuario(this.userGuid, this.usuarioData);

    request$.subscribe({
      next: (response) => {
        this.responseRequest = response;
        this.isLoading = false; //  Ocultar spinner
        if (this.responseRequest.solicitud_exitosa) {
          const mensaje = esNuevo ? 'Usuario creado exitosamente' : 'Usuario actualizado correctamente';
          this.snackBar.open(mensaje, '', { duration: 3000 });
          this.router.navigate(['/usuarios/listar']);
        } else {
          this.snackBar.open("Error al guardar el registro", '', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.isLoading = false; //  Ocultar spinner si hay error
        const mensajeError = esNuevo
          ? error?.error?.mensaje || 'Error al guardar el usuario'
          : error?.error?.mensaje || 'Error al actualizar el usuario';
        this.snackBar.open(mensajeError, '', { duration: 3000 });
      }
    });
    // if (!this.userGuid) {
    //   return;
    // }

    // if (!this.usuarioData.first_name?.trim() || !this.usuarioData.last_name?.trim() || !this.usuarioData.email?.trim()) {
    //   this.snackBar.open('Complete los campos obligatorios de información general', '', { duration: 3000 });
    //   return;
    // }

    // this.isLoading = true;

    // const payload = new Usuarios({
    //   first_name: this.usuarioData.first_name?.trim(),
    //   other_name: this.usuarioData.other_name?.trim() || undefined,
    //   last_name: this.usuarioData.last_name?.trim(),
    //   other_last_name: this.usuarioData.other_last_name?.trim() || undefined,
    //   identification_type: Number(this.usuarioData.identification_type ?? 0),
    //   identification_number: Number(this.usuarioData.identification_number ?? 0),
    //   email: this.usuarioData.email?.trim(),
    //   position: this.usuarioData.position?.trim() || undefined,
    //   is_active: !!this.usuarioData.is_active,
    //   program_ids: this.usuarioData.program_ids ?? [],
    //   role_ids: this.usuarioData.role_ids ?? [],
    // });

    // this.usuariosService.actualizarUsuario(this.userGuid, payload).subscribe({
    //   next: response => {
    //     this.responseRequest = response;
    //     this.isLoading = false;

    //     if (response.solicitud_exitosa) {
    //       this.snackBar.open('Usuario actualizado correctamente', '', { duration: 3000 });
    //       this.volver();
    //       return;
    //     }

    //     this.snackBar.open(response.mensaje || 'No se pudo actualizar el usuario', '', { duration: 3000 });
    //   },
    //   error: () => {
    //     this.isLoading = false;
    //     this.snackBar.open('Error al actualizar el usuario', '', { duration: 3000 });
    //   },
    // });
  }

  volver(): void {
    this.router.navigate(['/usuarios/listar']);
  }

  private sincronizarAsignarTodosProgramas(): void {
    const total = this.programasCatalogo.length;
    const seleccionados = this.usuarioData.program_ids?.length ?? 0;
    this.asignarTodosProgramas = total > 0 && seleccionados === total;
  }
}
