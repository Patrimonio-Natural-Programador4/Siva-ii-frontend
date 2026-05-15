import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, AfterViewInit, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageHeader } from '@shared';
import { Usuarios } from 'src/app/models/usuarios';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ValidarUsuarioModal, ValidarUsuarioModalResult } from './validar-usuario-modal';

interface UsuarioRow extends Usuarios {
  nombreCompleto: string;
  rolDisplay: string;
}

@Component({
  selector: 'app-listar',
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
  ]
})
export class Listar implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly usuariosService = inject(UsuariosService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = ['numero', 'usuario', 'correo', 'cargo', 'acciones'];
  readonly pageSizeOptions = [20];
  readonly usuariosTable = new MatTableDataSource<Usuarios>([]);

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.usuariosTable.filterPredicate = (usuario, filter) => {
      const f = normalize(filter);
      return (
        normalize(usuario.full_name ?? '').includes(f) ||
        normalize(usuario.email ?? '').includes(f) ||
        normalize(usuario.position ?? '').includes(f)
      );
    };
    this.getUsuarios();
  }

  getUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe(data => {
      this.usuariosTable.data = data;
    });
  }


  ngAfterViewInit(): void {
    const paginator = this.paginator();

    if (paginator) {
      this.usuariosTable.paginator = paginator;
    }
  }

  buscarUsuarios(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usuariosTable.filter = filterValue.trim().toLowerCase();

    if (this.usuariosTable.paginator) {
      this.usuariosTable.paginator.firstPage();
    }
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();

    if (!paginator) {
      return index + 1;
    }

    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  onEditar(usuario: Usuarios) {
    if (!usuario.guid) {
      return;
    }

    this.router.navigate(['/usuarios/editar', usuario.guid]);
  }

  abrirModalValidacion(row: Usuarios): void {
    this.dialog
      .open(ValidarUsuarioModal, { width: '520px', data: { usuario: row } })
      .afterClosed()
      .subscribe((result: ValidarUsuarioModalResult | undefined) => {
        if (result?.success) {
          this.usuariosService.getUsuarios().subscribe(usuarios => {
            this.usuariosTable.data = usuarios;
          });
        }
      });
  }
}
