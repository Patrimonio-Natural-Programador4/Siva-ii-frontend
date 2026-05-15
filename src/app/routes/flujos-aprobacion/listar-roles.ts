import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, inject, viewChild } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';

import { RolesAprobacion } from 'src/app/models/roles-aprobacion';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';
import { NumeroCaracteresPipe } from './numero-caracteres.pipe';

@Component({
  selector: 'app-flujos-aprobacion-listar-roles',
  templateUrl: './listar-roles.html',
  styleUrl: './listar-roles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, UpperCasePipe, NumeroCaracteresPipe, MatCardModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule],
})
export class ListarRolesAprobacion implements OnInit, AfterViewInit {
  private readonly service = inject(FlujosAprobacionService);
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = ['numero', 'nombre', 'descripcion', 'usuarios', 'acciones'];
  readonly pageSizeOptions = [20];
  readonly dataSource = new MatTableDataSource<RolesAprobacion>([]);

  ngOnInit(): void {
    this.service.getRolesAprobacion().subscribe(data => {
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

  crearRol(): void {
    this.router.navigate(['/flujos-aprobacion/roles/crear']);
  }

  editarRol(rol: RolesAprobacion): void {
    if (!rol.id_rol_aprobacion) {
      return;
    }

    this.router.navigate(['/flujos-aprobacion/roles/editar', rol.id_rol_aprobacion]);
  }
}