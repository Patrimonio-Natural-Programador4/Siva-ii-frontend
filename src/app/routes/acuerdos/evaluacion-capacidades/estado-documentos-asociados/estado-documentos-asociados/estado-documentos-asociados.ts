import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

export interface DocumentoEstado {
  id: number;
  is_required: boolean;
  description: string;
  color: 'green' | 'red';
}

@Component({
  selector: 'app-estado-documentos-asociados',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, NgClass],
  templateUrl: './estado-documentos-asociados.html',
  styleUrl: './estado-documentos-asociados.scss',
})
export class EstadoDocumentosAsociados {
  readonly documentos = inject<DocumentoEstado[]>(MAT_DIALOG_DATA);
  readonly cargados = this.documentos.filter(d => d.color === 'green').length;
}
