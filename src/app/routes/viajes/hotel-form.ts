import { Component, inject, ViewChild } from '@angular/core';
import { Listados } from 'src/app/models/listados';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { Subject } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { ViajesHotel } from 'src/app/models/viajes-hotel';

export const MY_FORMATS = {
  parse: {
    dateInput: 'yyyy-MM-dd',
    timeInput: 'HH:mm'
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'yyyy MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'yyyy MMMM dd',
    timeInput: 'HH:mm',
    timeOptionLabel: 'HH:mm'
  },
};
@Component({
  selector: 'app-hotel-form',
  imports: [
    CommonModule, 
    MatSidenavModule, 
    MatButtonModule, 
    MatDialogModule,
    MatIconModule, 
    MatInputModule, 
    ReactiveFormsModule, 
    FormsModule, 
    MatDatepickerModule,
    MatSelectModule, 
    MatTimepickerModule
  ],
  templateUrl: './hotel-form.html',
  styleUrl: './hotel-form.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class HotelForm {
  @ViewChild('f') form!: NgForm;
  private readonly drawerRef = inject(MtxDrawerRef<HotelForm>);
  hotelChanged$!: Subject<ViajesHotel>;
  listados: Listados[] = [];
  municipios: any[] = [];
  minDate?: Date;
  maxDate?: Date;
  hotel: ViajesHotel = {};

  ngOnInit(): void {
    if (this.hotel.id_departamento) {
      this.municipios = this.listados[1]?.lista_generica
        ? this.listados[1].lista_generica.filter(p => p.idrelacion == this.hotel.id_departamento)
        : [];
    }
  }

  municipio(){
    this.hotel.id_municipio = null!;
    this.municipios = this.listados[1]?.lista_generica
      ? this.listados[1].lista_generica.filter(p => p.idrelacion == this.hotel.id_departamento)
      : [];
  }

  guardar(): void {

    this.hotelChanged$.next({ ...this.hotel });
    this.hotel = {};
    this.municipios = [];

    if (this.form) {
      this.form.resetForm({
        id_departamento: null,
        id_municipio: null,
        fecha_llegada: null,
        fecha_salida: null,
        observaciones: null
      });
    }
  }

  cancelar(): void {
    this.drawerRef.dismiss();
  }

}
