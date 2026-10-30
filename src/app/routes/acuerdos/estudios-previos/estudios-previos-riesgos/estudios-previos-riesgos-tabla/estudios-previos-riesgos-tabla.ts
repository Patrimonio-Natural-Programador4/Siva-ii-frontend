import { Component, effect, inject, input, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { RisksModel } from 'src/app/models/risks';
import { RisksService } from 'src/app/services/risks.service';
import { EstudiosPreviosRiesgosFormulario } from '../estudios-previos-riesgos-formulario/estudios-previos-riesgos-formulario';

@Component({
  selector: 'app-estudios-previos-riesgos-tabla',
  imports: [MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './estudios-previos-riesgos-tabla.html',
  styleUrl: './estudios-previos-riesgos-tabla.scss',
})
export class EstudiosPreviosRiesgosTabla {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly risksService = inject(RisksService);
  private readonly cdr = inject(ChangeDetectorRef);

  estudioPrevioId = input<number | undefined>();

  riesgos: RisksModel[] = [];
  isLoading = false;
  displayedColumns = ['risk', 'mitigation', 'acciones'];

  constructor() {
    effect(() => {
      const id = this.estudioPrevioId();
      if (id) {
        this.cargarRiesgos(id);
      }
    });
  }

  cargarRiesgos(id: number): void {
    this.isLoading = true;
    this.risksService.get_by_previous_studies(id).subscribe({
      next: r => {
        this.riesgos = r ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.riesgos = [];
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Error al cargar los riesgos', '', { duration: 3000 });
      },
    });
  }

  agregarRiesgo(): void {
    this.abrirFormulario();
  }

  editarRiesgo(riesgo: RisksModel): void {
    this.abrirFormulario(riesgo);
  }

  private abrirFormulario(riesgo?: RisksModel): void {
    const id = this.estudioPrevioId();
    if (!id) return;

    const ref = this.dialog.open(EstudiosPreviosRiesgosFormulario, {
      width: '480px',
      height: '100vh',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      disableClose: true,
      panelClass: 'drawer-panel',
      data: { estudioPrevioId: id, riesgo },
    });

    ref.afterClosed().subscribe(guardado => {
      if (guardado) {
        this.snackBar.open('Riesgo guardado correctamente', '', { duration: 3000 });
        this.cargarRiesgos(id);
      }
    });
  }
}
