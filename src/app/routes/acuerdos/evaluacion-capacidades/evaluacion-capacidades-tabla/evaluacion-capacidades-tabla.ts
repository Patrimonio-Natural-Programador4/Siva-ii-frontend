import { UpperCasePipe, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, OnInit, inject, viewChild } from '@angular/core';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';

import { EvaluacionCapacidadesModel } from 'src/app/models/evaluacion-capacidades';
import { EvaluacionCapacidadesService } from 'src/app/services/evaluacion-capacidades/evaluacion-capacidades.service';

@Component({
  selector: 'evaluacion-capacidades-tabla',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    PageHeader,
    UpperCasePipe,
    CommonModule,
  ],
  templateUrl: './evaluacion-capacidades-tabla.html',
  styleUrl: './evaluacion-capacidades-tabla.scss',
})
export class EvaluacionCapacidadesTabla implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly EvaluacionCapacidadesService = inject(EvaluacionCapacidadesService);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = [
    'id',
    'name',
    'observation',
    'approximate_value',
    'create_date',
    'policy_approval_date',
    'document_signature_date',
    'start_date',
    'end_date',
    'code',
    'programa',
    'pid',
    'implementer',
    'aproval_request',
    'person',
    'capacity_assessments_state',
    'modalitie',
  ];

  readonly pageSizeOptions = [20];
  readonly evCapacidadesTable = new MatTableDataSource<EvaluacionCapacidadesModel>([]);

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.evCapacidadesTable.filterPredicate = (p, filter) => {
      const f = normalize(filter);
      return normalize(p.name ?? '').includes(f);
    };
    this.getEvaCapacidades();
    this.EvaluacionCapacidadesService.refrescarTabla$.subscribe(() => this.getEvaCapacidades());
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.evCapacidadesTable.paginator = paginator;
    }
  }

  getEvaCapacidades(): void {
    this.EvaluacionCapacidadesService.getEvaCapacidades().subscribe(data => {
      console.log('evaluacion capacidades', data);

      this.evCapacidadesTable.data = data;
    });
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();
    if (!paginator) {
      return index + 1;
    }
    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.evCapacidadesTable.filter = filterValue.trim().toLowerCase();
  }

  crearEvaCapacidades(): void {
    this.router.navigate(['/acuerdos/evaluacion-capacidades/crear']);
  }
}
