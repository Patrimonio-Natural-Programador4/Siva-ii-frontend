import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { Subject } from 'rxjs';
import { ViajesService } from 'src/app/services/viajes.service';
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './legalizacion-form.html',
})
export class LegalizacionForm implements OnInit {
  @ViewChild('f') f?: NgForm;

  drawerRef = inject(MtxDrawerRef);
  viajesService = inject(ViajesService);
  snackBar = inject(MatSnackBar);

  private _travelRequestId!: number;
  get travelRequestId(): number {
    return this._travelRequestId;
  }
  set travelRequestId(val: number) {
    this._travelRequestId = val;
    if (val && !this.isLoading && !this.datosCargados) {
      this.cargarLegalizacionExistente();
    }
  }

  legalizacionChanged$ = new Subject<any>();

  isLoading = false;
  isSaving = false;
  isEdit = false;
  legalizationId?: number;
  datosCargados = false;

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

  private _legalizacionId?: number;
  get legalizacionId(): number | undefined {
    return this._legalizacionId;
  }
  set legalizacionId(val: number | undefined) {
    this._legalizacionId = val;
    if (this._travelRequestId && val && !this.isLoading && !this.datosCargados) {
      this.cargarLegalizacionExistente();
    }
  }

  ngOnInit(): void {
    if (this._travelRequestId && this._legalizacionId && !this.datosCargados) {
      this.cargarLegalizacionExistente();
    }
  }

  cargarLegalizacionExistente() {
    if (!this._travelRequestId || !this._legalizacionId) return;
    this.isLoading = true;
    this.viajesService.getLegalizacionByTravelId(this._travelRequestId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.datosCargados = true;
        
        let targetLeg = null;
        if (Array.isArray(res)) {
          targetLeg = res.find((l: any) => l.legalization_id === this._legalizacionId);
        } else {
          targetLeg = res;
        }

        if (targetLeg && targetLeg.legalization_id) {
          this.isEdit = true;
          this.legalizationId = targetLeg.legalization_id;

          let parsedDate: Date | null = null;
          if (targetLeg.check_date) {
            const dateStr = String(targetLeg.check_date).substring(0, 10);
            parsedDate = new Date(`${dateStr}T00:00:00`);
          }

          this.legalizacion = {
            check_date: parsedDate,
            check_number: targetLeg.check_number ?? null,
            beneficiary: targetLeg.beneficiary ?? null,
            nit_beneficiary: targetLeg.nit_beneficiary ?? null,
            observations_outlay: targetLeg.observations_outlay ?? null,
            regimen_type_id: targetLeg.regimen_type_id ?? null,
            subtotal: targetLeg.subtotal != null ? Number(targetLeg.subtotal) : 0,
            iva: targetLeg.iva != null ? Number(targetLeg.iva) : 0,
            retention_porcentage: targetLeg.retention_porcentage != null ? Number(targetLeg.retention_porcentage) : 0,
            retention: targetLeg.retention != null ? Number(targetLeg.retention) : 0,
            amount_paid: targetLeg.amount_paid != null ? Number(targetLeg.amount_paid) : 0,
            observations: targetLeg.observations ?? null,
          };
        }
      },
      error: err => {
        this.isLoading = false;
        this.datosCargados = true;
        if (err.status === 404) {
          this.isEdit = false;
        } else {
          this.snackBar.open('Error al cargar la información de la legalización', 'Cerrar', {
            duration: 3000,
          });
        }
      },
    });
  }

  cancelar() {
    this.drawerRef.dismiss();
  }

  calcularRetencion() {
    const subtotal = Number(this.legalizacion.subtotal) || 0;
    const porcentaje = Number(this.legalizacion.retention_porcentage) || 0;
    this.legalizacion.retention = (subtotal * porcentaje) / 100;
    this.calcularTotal();
  }

  calcularTotal() {
    const subtotal = Number(this.legalizacion.subtotal) || 0;
    const iva = Number(this.legalizacion.iva) || 0;
    const retencion = Number(this.legalizacion.retention) || 0;
    this.legalizacion.amount_paid = subtotal + iva - retencion;
  }

  guardar() {
    let checkDateFormatted: string | null = null;
    if (this.legalizacion.check_date) {
      if (this.legalizacion.check_date instanceof Date) {
        const d = this.legalizacion.check_date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        checkDateFormatted = `${year}-${month}-${day}`;
      } else if (typeof this.legalizacion.check_date === 'string') {
        checkDateFormatted = this.legalizacion.check_date.substring(0, 10);
      }
    }

    const payload = {
      ...this.legalizacion,
      check_date: checkDateFormatted,
      travel_request_id: this._travelRequestId,
    };

    this.isSaving = true;

    if (this.isEdit && this.legalizationId) {
      this.viajesService.actualizarLegalizacion(this.legalizationId, payload).subscribe({
        next: res => {
          this.isSaving = false;
          this.snackBar.open('Legalización actualizada correctamente', 'Cerrar', {
            duration: 3000,
          });
          this.legalizacionChanged$.next(res);
          this.drawerRef.dismiss(res);
        },
        error: err => {
          this.isSaving = false;
          this.snackBar.open('Error al actualizar la legalización', 'Cerrar', { duration: 3000 });
          console.error(err);
        },
      });
    } else {
      this.viajesService.guardarLegalizacion(payload).subscribe({
        next: res => {
          this.isSaving = false;
          this.snackBar.open('Legalización guardada correctamente', 'Cerrar', { duration: 3000 });
          this.legalizacionChanged$.next(res);
          this.drawerRef.dismiss(res);
        },
        error: err => {
          this.isSaving = false;
          this.snackBar.open('Error al guardar la legalización', 'Cerrar', { duration: 3000 });
          console.error(err);
        },
      });
    }
  }
}
