import { UpperCasePipe } from '@angular/common';
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
import { PageHeader } from '@shared';
import { AprobacionDocumentosService } from 'src/app/services/aprobacion-documentos/aprobacion-documentos.service';
import { AprobacionDocumentos as aproDoModel } from 'src/app/models/aprobacion-documentos';

@Component({
  selector: 'app-aprobacion-documentos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    UpperCasePipe,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './aprobacion-documentos.html',
  styleUrl: './aprobacion-documentos.scss',
})
export class AprobacionDocumentos implements OnInit, AfterViewInit {
  private readonly aprobacionDocumentosService = inject(AprobacionDocumentosService);
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = ['id', 'documento', 'categoria', 'programa', 'acciones'];
  readonly pageSizeOptions = [20];
  readonly aproDocsTable = new MatTableDataSource<aproDoModel>([]);

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.aproDocsTable.filterPredicate = (p, filter) => {
      const f = normalize(filter);
      return normalize(p.documento ?? '').includes(f);
    };

    this.getAprobDoc();
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.aproDocsTable.paginator = paginator;
    }
  }

  getAprobDoc(): void {
    this.aprobacionDocumentosService.getAprobDoc().subscribe(data => {
      this.aproDocsTable.data = data;
    });
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();
    if (!paginator) {
      return index + 1;
    }
    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  crearDocumento(): void {
    console.log('crearDocumento');
    this.router.navigate(['flujos-aprobacion/aprobacion-documentos/crear']);
  }

  editarDocumento(documento: aproDoModel): void {
    if (!documento.id) {
      return;
    }

    this.router.navigate(['flujos-aprobacion/aprobacion-documentos/editar', documento.id]);
  }
}
