import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';

import { FlujosAprobacion } from 'src/app/models/flujos-aprobacion';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';

@Component({
  selector: 'app-flujos-aprobacion-listar',
  templateUrl: './listar.html',
  styleUrl: './listar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, MatCardModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule],
})
export class ListarFlujosAprobacion implements OnInit, AfterViewInit {
  private readonly service = inject(FlujosAprobacionService);
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = ['numero', 'nombre', 'descripcion', 'categoria', 'acciones'];
  readonly pageSizeOptions = [20];
  readonly dataSource = new MatTableDataSource<FlujosAprobacion>([]);

  ngOnInit(): void {
    this.service.getFlujosAprobacion().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();
    if (!paginator) {
      return index + 1;
    }

    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  crearFlujo(): void {
    this.router.navigate(['/flujos-aprobacion/crear']);
  }

  editarFlujo(flujo: FlujosAprobacion): void {
    if (!flujo.id_flujo_aprobacion) {
      return;
    }

    this.router.navigate(['/flujos-aprobacion/editar', flujo.id_flujo_aprobacion]);
  }
}