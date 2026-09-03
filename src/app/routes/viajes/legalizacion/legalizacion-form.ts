import { Component, OnInit, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
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
import { TravelLegalization } from 'src/app/models/travel-legalization';

@Component({
  selector: 'app-legalizacion-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
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

  readonly drawerRef = inject(MtxDrawerRef);
  private readonly viajesService = inject(ViajesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  travelRequestId!: number;
  legalizacionId?: number;

  private _legalizacionData?: TravelLegalization;
  get legalizacionData(): TravelLegalization | undefined {
    return this._legalizacionData;
  }
  set legalizacionData(val: TravelLegalization | undefined) {
    this._legalizacionData = val;
    if (val) {
      this.cargarDesdeObjeto(val);
    }
  }

  legalizacionChanged$ = new Subject<any>();

  isLoading = false;
  isSaving = false;
  isEdit = false;

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

  ngOnInit(): void {
    if (this._legalizacionData) {
      this.cargarDesdeObjeto(this._legalizacionData);
    } else if (this.travelRequestId && this.legalizacionId) {
      this.cargarLegalizacionExistente();
    }
  }

  inicializarEdicion(data: TravelLegalization, travelRequestId?: number): void {
    if (travelRequestId) {
      this.travelRequestId = travelRequestId;
    }
    this.cargarDesdeObjeto(data);
  }

  cargarDesdeObjeto(data: TravelLegalization): void {
    this.isEdit = true;
    this.legalizacionId = data.legalization_id;

    let parsedDate: Date | null = null;
    if (data.check_date) {
      if (data.check_date instanceof Date) {
        parsedDate = data.check_date;
      } else {
        const dateStr = String(data.check_date).substring(0, 10);
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          parsedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          parsedDate = new Date(data.check_date);
        }
      }
    }

    this.legalizacion = {
      check_date: parsedDate,
      check_number: data.check_number ?? null,
      beneficiary: data.beneficiary ?? null,
      nit_beneficiary: data.nit_beneficiary ?? null,
      observations_outlay: data.observations_outlay ?? null,
      regimen_type_id: data.regimen_type_id != null ? Number(data.regimen_type_id) : null,
      subtotal: data.subtotal != null ? Number(data.subtotal) : 0,
      iva: data.iva != null ? Number(data.iva) : 0,
      retention_porcentage:
        data.retention_porcentage != null ? Number(data.retention_porcentage) : 0,
      retention: data.retention != null ? Number(data.retention) : 0,
      amount_paid: data.amount_paid != null ? Number(data.amount_paid) : 0,
      observations: data.observations ?? null,
    };

    this.cdr.markForCheck();
  }

  cargarLegalizacionExistente() {
    if (!this.travelRequestId || !this.legalizacionId) return;
    this.isLoading = true;
    this.viajesService.getLegalizacionByTravelId(this.travelRequestId).subscribe({
      next: (res: TravelLegalization[]) => {
        this.isLoading = false;
        let targetLeg: TravelLegalization | undefined;
        if (Array.isArray(res)) {
          targetLeg = res.find(l => l.legalization_id === this.legalizacionId);
        }

        if (targetLeg) {
          this.cargarDesdeObjeto(targetLeg);
        } else {
          this.isEdit = false;
        }
      },
      error: err => {
        this.isLoading = false;
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
    this.legalizacion.retention = Math.round(((subtotal * porcentaje) / 100) * 100) / 100;
    this.calcularTotal();
  }

  calcularTotal() {
    const subtotal = Number(this.legalizacion.subtotal) || 0;
    const iva = Number(this.legalizacion.iva) || 0;
    const retencion = Number(this.legalizacion.retention) || 0;
    this.legalizacion.amount_paid = Math.round((subtotal + iva - retencion) * 100) / 100;
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
      travel_request_id: this.travelRequestId,
      regimen_type_id: Number(this.legalizacion.regimen_type_id),
      subtotal: Number(this.legalizacion.subtotal),
      iva: Number(this.legalizacion.iva),
      retention_porcentage: Number(this.legalizacion.retention_porcentage),
      retention: Number(this.legalizacion.retention),
      amount_paid: Number(this.legalizacion.amount_paid),
    };

    this.isSaving = true;

    if (this.isEdit && this.legalizacionId) {
      this.viajesService.actualizarLegalizacion(this.legalizacionId, payload).subscribe({
        next: res => {
          this.isSaving = false;
          this.snackBar.open('Legalización actualizada correctamente', 'Cerrar', {
            duration: 3000,
          });
          this.legalizacionChanged$.next(res || payload);
          this.drawerRef.dismiss(res || payload || true);
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
          this.legalizacionChanged$.next(res || payload);
          this.drawerRef.dismiss(res || payload || true);
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
