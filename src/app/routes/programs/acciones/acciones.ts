import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
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
    const parsedId = idParam ? Number(idParam) : null;
    this.idPrograma = parsedId && Number.isFinite(parsedId) ? parsedId : null;
    this.accion = this.idPrograma ? 'Editar' : 'Nuevo';

    if (this.idPrograma) {
      this.isLoading = true;
      this.programsService.getProgramById(this.idPrograma).subscribe({
        next: data => {
          this.programaData = new Programs(data);
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          // Some backend stacks answer 200 but with a payload the browser cannot parse as JSON.
          // In that case Angular routes it to error with status 200.
          if (err.status === 200 && typeof err.error === 'string') {
            try {
              const parsed = JSON.parse(err.error);
              this.programaData = new Programs(parsed);
              this.isLoading = false;
              return;
            } catch {
              // Continue to standard error flow.
            }
          }

          console.error('Error al cargar el programa:', err);
          this.snackBar.open('Error al cargar el programa', '', { duration: 3000 });
          this.isLoading = false;
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
