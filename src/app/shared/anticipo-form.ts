import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Listados } from 'src/app/models/listados';
import { MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { Subject } from 'rxjs';
import { AnticiposDetalle } from '../models/anticipos-detalle';

@Component({
  selector: 'app-anticipo-form',
  imports: [
    CommonModule, 
    MatSidenavModule, 
    MatButtonModule, 
    MatDialogModule,
    MatIconModule, 
    MatInputModule, 
    ReactiveFormsModule, 
    FormsModule, 
    MatSelectModule],
  templateUrl: './anticipo-form.html',
  styleUrl: './anticipo-form.scss',
})
export class AnticipoForm implements OnInit {
  @ViewChild('f') form!: NgForm;
  private readonly drawerRef = inject(MtxDrawerRef<AnticipoForm>);
  anticipoChanged$!: Subject<AnticiposDetalle>;
  anticipo: AnticiposDetalle = {};
  listados: Listados[] = [];
  ngOnInit(): void {

  }

  guardar(): void {
    this.anticipoChanged$.next({ ...this.anticipo });
    this.anticipo = {};
    if (this.form) {
      this.form.resetForm({
        id_concepto: null,
        valor_anticipo: null,
        observaciones: null
      });
    }
  }

  cancelar(): void {
    this.drawerRef.dismiss();
  }
}
