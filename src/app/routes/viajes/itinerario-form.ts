import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ViajesItinerario } from 'src/app/models/viajes-itinerario';
import { Listados } from 'src/app/models/listados';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { Subject } from 'rxjs';

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
  selector: 'app-itinerario-form',
  imports: [
    MatTableModule, 
    MatCheckboxModule, 
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
    MatTimepickerModule],
  templateUrl: './itinerario-form.html',
  styleUrl: './itinerario-form.scss',
  providers: [
      { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})
export class ItinerarioForm implements OnInit {
  @ViewChild('f') form!: NgForm;
  private readonly drawerRef = inject(MtxDrawerRef<ItinerarioForm>);
  itinerarioChanged$!: Subject<ViajesItinerario>;
  regresoChanged$!: Subject<ViajesItinerario>;
  itinerario: ViajesItinerario = {
    regreso: false
  };
  regreso: ViajesItinerario = {};
  listados: Listados[] = [];
  municipiosOrigen: any[] = [];
  municipiosDestino: any[] = [];

  minDate?: Date;
  maxDate?: Date;
  horaViaje?: Date;
  horaRegreso?: Date;

  ngOnInit(): void {
    if (this.itinerario.id_departamento_origen) {
      this.municipiosOrigen = this.listados[1]?.lista_generica
        ? this.listados[1].lista_generica.filter(p => p.idrelacion == this.itinerario.id_departamento_origen)
        : [];
    }
    if (this.itinerario.id_departamento_destino) {
      this.municipiosDestino = this.listados[1]?.lista_generica
        ? this.listados[1].lista_generica.filter(p => p.idrelacion == this.itinerario.id_departamento_destino)
        : [];
    }
    if (this.itinerario.hora) {
      const [hours, minutes] = this.itinerario.hora.split(':');
      const date = new Date();
      date.setHours(Number(hours), Number(minutes), 0, 0);
      this.horaViaje = date;
    }
  }

  municipioOrigen(){
    this.itinerario.id_municipio_origen = null!;
    this.municipiosOrigen = this.listados[1]?.lista_generica
      ? this.listados[1].lista_generica.filter(p => p.idrelacion == this.itinerario.id_departamento_origen)
      : [];
  }

  municipioDestino(){
    this.itinerario.id_municipio_destino = null!;
    this.municipiosDestino = this.listados[1]?.lista_generica
      ? this.listados[1].lista_generica.filter(p => p.idrelacion == this.itinerario.id_departamento_destino)
      : [];
  }

  guardar(): void {
    if (this.horaViaje) {
      const hours = String(this.horaViaje.getHours()).padStart(2, '0');
      const minutes = String(this.horaViaje.getMinutes()).padStart(2, '0');
      this.itinerario.hora = `${hours}:${minutes}`;
    }

    if(this.itinerario.regreso) {
      this.regreso = { ...this.itinerario };
      if (this.horaRegreso) {
        const hours = String(this.horaRegreso.getHours()).padStart(2, '0');
        const minutes = String(this.horaRegreso.getMinutes()).padStart(2, '0');
        this.regreso.hora_regreso = `${hours}:${minutes}`;
        this.regreso.fecha = this.itinerario.fecha_regreso;
        this.regreso.id_municipio_origen = this.itinerario.id_municipio_destino;
        this.regreso.id_municipio_destino = this.itinerario.id_municipio_origen;
        this.regreso.id_departamento_origen = this.itinerario.id_departamento_destino;
        this.regreso.id_departamento_destino = this.itinerario.id_departamento_origen;
        this.regreso.padre = 'regreso';
      }
    }

    this.itinerarioChanged$.next({ ...this.itinerario });
    if(this.itinerario.regreso) {
      this.regresoChanged$.next({ ...this.regreso });
    }
    this.itinerario = {};
    this.horaViaje = undefined;
    this.municipiosOrigen = [];
    this.municipiosDestino = [];

    if (this.form) {
      this.form.resetForm({
        id_departamento_origen: null,
        id_municipio_origen: null,
        id_departamento_destino: null,
        id_municipio_destino: null,
        requiere_tiquetes_aereos: null,
        es_zona_rural: null
      });
    }
  }

  cancelar(): void {
    this.drawerRef.dismiss();
  }

  
}
