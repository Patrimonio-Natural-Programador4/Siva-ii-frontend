import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';

import { TipoDocumentoAcuerdoModel } from 'src/app/models/tipos-documento-acuerdos';
import { TiposDocumentoAcuerdosService as tipodocacuser } from 'src/app/services/aprobacion-documentos/tipos-documento-acuerdos.service';

@Component({
  selector: 'app-tipos-documento-acuerdo-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './tipos-documento-acuerdo-tabla.html',
  styleUrl: './tipos-documento-acuerdo-tabla.scss',
})
export class TiposDocumentoAcuerdoTabla implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly tiposDocAcuService = inject(tipodocacuser);

  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = [
    'id',
    'code',
    'description',
    'template',
    'number',
    'template_path',
    'is_required',
    'documents_approval_id',
  ];

  readonly pageSizeOptions = [20];
  readonly tipoDocAcuTable = new MatTableDataSource<TipoDocumentoAcuerdoModel>([]);

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.tipoDocAcuTable.filterPredicate = (p, filter) => {
      const f = normalize(filter);
      return normalize(p.template ?? '').includes(f);
    };
    this.getTiposDocAcuerdo();
    this.tiposDocAcuService.refrescarTabla$.subscribe(() => this.getTiposDocAcuerdo());
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.tipoDocAcuTable.paginator = paginator;
    }
  }

  getTiposDocAcuerdo(): void {
    this.tiposDocAcuService.getTipoDocAcuerdos().subscribe(data => {
      this.tipoDocAcuTable.data = data;
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
    this.tipoDocAcuTable.filter = filterValue.trim().toLowerCase();
  }
}
