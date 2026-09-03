import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { PageHeader } from '@shared';
import {
  ParametroDocumento,
  WordParametersService,
} from 'src/app/services/word-parameters.service';

@Component({
  selector: 'app-extraccion-parametros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './extraccion-parametros.html',
  styleUrl: './extraccion-parametros.scss',
})
export class ExtraccionParametros {
  private readonly wordParametersService = inject(WordParametersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly displayedColumns = ['nombre', 'valor'];
  archivoSeleccionado: File | null = null;
  parametros: ParametroDocumento[] = [];
  isLoading = false;

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado = input.files?.[0] ?? null;
    this.parametros = [];
  }

  extraerParametros(): void {
    if (!this.archivoSeleccionado || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.wordParametersService.extraerParametros(this.archivoSeleccionado).subscribe({
      next: response => {
        this.parametros = response.parametros;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.snackBar.open(error.error?.detail ?? 'No fue posible leer el documento.', '', {
          duration: 5000,
        });
      },
    });
  }
}