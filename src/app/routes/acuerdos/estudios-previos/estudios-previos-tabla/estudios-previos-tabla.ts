import { Component, inject, viewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { UpperCasePipe, CommonModule } from '@angular/common';

import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { EstudiosPreviosService as estpreviosser } from 'src/app/services/estudios-previos/estudios-previos.service';
@Component({
  selector: 'app-estudios-previos-tabla',
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
  templateUrl: './estudios-previos-tabla.html',
  styleUrl: './estudios-previos-tabla.scss',
})
export class EstudiosPreviosTabla implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly estPreviosService = inject(estpreviosser);
  readonly paginator = viewChild(MatPaginator);
  readonly displayedColumns = [
    'id',
    'precedents',
    'justification',
    'scope',
    'overall_objective',
    'term',
    'obligations',
    'supervisor',
    //'user_session',
    //'create_date',
    'total_value',
    'contributions_ei',
    'total_value_executes_fpn',
    'total_value_executes_ei',
    'cap_assessments_state',
    'app_request',
    'implementers',
    'persons',
    'capacity_assessment',
    'contributions_fpn',
    'estimated_term',
  ];

  readonly pageSizeOptions = [20];
  readonly estPreviosTable = new MatTableDataSource<PreviousStudiesModel>([]);

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.estPreviosTable.filterPredicate = (p, filter) => {
      const f = normalize(filter);
      return normalize(p.justification ?? '').includes(f);
    };
    this.getEstudiosPreviosAcuerdo();
    this.estPreviosService.refrescarTabla$.subscribe(() => this.getEstudiosPreviosAcuerdo());
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.estPreviosTable.paginator = paginator;
    }
  }

  getEstudiosPreviosAcuerdo(): void {
    this.estPreviosService.getEstPrevios().subscribe(data => {
      this.estPreviosTable.data = data;
      console.log('estudios previos', data);
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
    this.estPreviosTable.filter = filterValue.trim().toLowerCase();
  }

  crearEstudiosPreviosAcuerdo(): void {
    this.router.navigate(['/acuerdos/estudios-previos/crear']);
  }
}
