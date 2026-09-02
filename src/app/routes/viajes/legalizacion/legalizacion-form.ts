import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { Subject } from 'rxjs';
import { ViajesService } from 'src/app/services/viajes.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-legalizacion-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  templateUrl: './legalizacion-form.html',
})
export class LegalizacionForm {
  drawerRef = inject(MtxDrawerRef);
  http = inject(HttpClient);
  snackBar = inject(MatSnackBar);

  travelRequestId!: number;
  legalizacionChanged$ = new Subject<any>();

  regimenTypes = [
    { id: 1, name: 'Responsable de IVA' },
    { id: 2, name: 'NO Responsable de IVA' },
    { id: 3, name: 'Regimen Simple de Tributación' },
    { id: 4, name: 'Regimen de tributación especial' },
  ];

  legalizacion: any = {
    check_date: null,
    check_number: null,
    beneficiary: null,
    nit_beneficiary: null,
    observations_outlay: null,
    regimen_type_id: null,
    subtotal: 0,
    iva: 0,
    retention_porcentage: 0,
    retention: 0,
    amount_paid: 0,
    observations: null,
  };

  cancelar() {
    this.drawerRef.dismiss();
  }

  calcularRetencion() {
    const subtotal = this.legalizacion.subtotal || 0;
    const porcentaje = this.legalizacion.retention_porcentage || 0;
    this.legalizacion.retention = (subtotal * porcentaje) / 100;
    this.calcularTotal();
  }

  calcularTotal() {
    const subtotal = this.legalizacion.subtotal || 0;
    const iva = this.legalizacion.iva || 0;
    const retencion = this.legalizacion.retention || 0;
    this.legalizacion.amount_paid = subtotal + iva - retencion;
  }

  guardar() {
    const payload = {
      ...this.legalizacion,
      travel_request_id: this.travelRequestId,
    };

    this.http.post(`${environment.apiUrl2}/viajes/legalizaciones`, payload).subscribe({
      next: res => {
        this.snackBar.open('Legalización guardada correctamente', 'Cerrar', { duration: 3000 });
        this.legalizacionChanged$.next(res);
        this.drawerRef.dismiss(res);
      },
      error: err => {
        this.snackBar.open('Error al guardar la legalización', 'Cerrar', { duration: 3000 });
        console.error(err);
      },
    });
  }
}
