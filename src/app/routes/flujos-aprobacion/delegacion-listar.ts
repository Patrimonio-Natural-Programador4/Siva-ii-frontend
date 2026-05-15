import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, inject, viewChild } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';

import { DelegacionRolesUsuarios } from 'src/app/models/delegacion-roles-usuarios';
import { FlujosAprobacionService } from 'src/app/services/flujos-aprobacion.service';

@Component({
  selector: 'app-flujos-aprobacion-delegacion-listar',
  templateUrl: './delegacion-listar.html',
  styleUrl: './delegacion-listar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, UpperCasePipe, MatCardModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule],
})
export class ListarDelegacionesAprobacion implements OnInit, AfterViewInit {
  private readonly service = inject(FlujosAprobacionService);
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = ['numero', 'rol', 'usuario', 'usuarios_delegados', 'acciones'];
  readonly pageSizeOptions = [20];
  readonly dataSource = new MatTableDataSource<DelegacionRolesUsuarios>([]);

  ngOnInit(): void {
    this.service.getDelegaciones().subscribe(data => {
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

  crearDelegacion(): void {
    this.router.navigate(['/flujos-aprobacion/delegacion/crear']);
  }

  editarDelegacion(delegacion: DelegacionRolesUsuarios): void {
    if (!delegacion.id_delegacion_roles_usuarios) {
      return;
    }

    this.router.navigate(['/flujos-aprobacion/delegacion/editar', delegacion.id_delegacion_roles_usuarios]);
  }
}