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
import { Programs } from 'src/app/models/programs';
import { ProgramsService } from 'src/app/services/programs.service';

@Component({
  selector: 'app-programs-listar',
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
export class ListarPrograms implements OnInit, AfterViewInit {
  private readonly programsService = inject(ProgramsService);
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = ['numero', 'name', 'description', 'code', 'acciones'];
  readonly pageSizeOptions = [20];
  readonly programsTable = new MatTableDataSource<Programs>([]);

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    this.programsTable.filterPredicate = (p, filter) => {
      const f = normalize(filter);
      return (
        normalize(p.name ?? '').includes(f) ||
        normalize(p.description ?? '').includes(f) ||
        normalize(p.code ?? '').includes(f)
      );
    };

    this.getPrograms();
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
      this.programsTable.paginator = paginator;
    }
  }

  getPrograms(): void {
    this.programsService.getPrograms().subscribe(data => {
      this.programsTable.data = data;
    });
  }

  buscar(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.programsTable.filter = filterValue.trim().toLowerCase();

    if (this.programsTable.paginator) {
      this.programsTable.paginator.firstPage();
    }
  }

  getRowNumber(index: number): number {
    const paginator = this.paginator();
    if (!paginator) {
      return index + 1;
    }
    return paginator.pageIndex * paginator.pageSize + index + 1;
  }

  crearPrograma(): void {
    this.router.navigate(['/programas/crear']);
  }

  editarPrograma(programa: Programs): void {
    this.router.navigate(['/programas/editar', programa.id_programa]);
  }
}
