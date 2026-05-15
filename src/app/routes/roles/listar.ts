import { UpperCasePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { Roles } from 'src/app/models/roles';
import { RolesService } from 'src/app/services/roles.service';

@Component({
  selector: 'app-roles-listar',
  templateUrl: './listar.html',
  styleUrl: './listar.scss',
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
})
export class ListarRoles implements OnInit, AfterViewInit {
  private readonly rolesService = inject(RolesService);
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = ['numero', 'rol', 'descripcion', 'acciones'];
  readonly pageSizeOptions = [20];
  readonly rolesTable = new MatTableDataSource<Roles>([]);

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.rolesTable.filterPredicate = (rol, filter) => {
      const f = normalize(filter);
      return normalize(rol.rol ?? '').includes(f) || normalize(rol.descripcion ?? '').includes(f);
    };

    this.getRoles();
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.rolesTable.paginator = paginator;
    }
  }

  getRoles(): void {
    this.rolesService.getRoles().subscribe(data => {
      this.rolesTable.data = data;
    });
  }

  buscarRoles(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.rolesTable.filter = filterValue.trim().toLowerCase();

    if (this.rolesTable.paginator) {
      this.rolesTable.paginator.firstPage();
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
    this.router.navigate(['/roles/crear']);
  }

  editarRol(rol: Roles): void {
    if (!rol.id_rol) {
      return;
    }

    this.router.navigate(['/roles/editar', rol.id_rol]);
  }
}
