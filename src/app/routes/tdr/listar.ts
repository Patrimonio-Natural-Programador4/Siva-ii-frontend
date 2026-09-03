import { Component, OnInit, AfterViewInit, inject, viewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { PageHeader } from '@shared';
import { UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar',
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
  templateUrl: './listar.html',
  styleUrl: './listar.scss',
})
export class ListarTdr  implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  readonly paginator = viewChild(MatPaginator);

  readonly displayedColumns = ['numero', 'rol', 'descripcion', 'acciones'];
  readonly pageSizeOptions = [20];

  ngOnInit(): void {
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  ngAfterViewInit(): void {
    const paginator = this.paginator();
    if (paginator) {
    }
  }


  crearTdr(): void {
    this.router.navigate(['/tdr/crear']);
  }

}
