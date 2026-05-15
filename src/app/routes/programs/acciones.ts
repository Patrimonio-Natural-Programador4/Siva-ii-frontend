import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '@shared';
import { Programs } from 'src/app/models/programs';
import { ResponseRequest } from 'src/app/models/response-request';
import { ProgramsService } from 'src/app/services/programs.service';

@Component({
  selector: 'app-programs-acciones',
  templateUrl: './acciones.html',
  styleUrl: './acciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class AccionesPrograms implements OnInit {
  private readonly programsService = inject(ProgramsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  accion = 'Nuevo';
  idPrograma: number | null = null;
  isLoading = false;

  programaData: Programs = new Programs({
    name: '',
    description: '',
    code: '',
  });

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: undefined,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];
    this.idPrograma = idParam ? Number(idParam) : null;
    this.accion = this.idPrograma ? 'Editar' : 'Nuevo';

    if (this.idPrograma) {
      this.programsService.getProgramById(this.idPrograma).subscribe({
        next: data => {
          this.programaData = new Programs(data);
        },
        error: () => {
          this.snackBar.open('Error al cargar el programa', '', { duration: 3000 });
        },
      });
    }
  }

  guardarPrograma(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const request$ = this.idPrograma
      ? this.programsService.updateProgram(this.programaData)
      : this.programsService.saveProgram(this.programaData);

    request$.subscribe({
      next: response => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje ?? 'Operación exitosa', '', { duration: 3000 });
          this.router.navigate(['/programs/listar']);
        } else {
          this.snackBar.open(response.mensaje ?? 'Error al guardar', '', { duration: 4000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al guardar el programa', '', { duration: 4000 });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/programs/listar']);
  }
}
