import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetInfo, EventClickInfo, EventInput } from 'fullcalendar';
import esLocale from 'fullcalendar/locales/es';
import dayGridPlugin from 'fullcalendar/daygrid';
import classicThemePlugin from 'fullcalendar/themes/classic';
import { PageHeader } from '@shared';
import { ViajesCalendar } from 'src/app/models/viajes';
import { ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-calendario-viajes',
  imports: [CommonModule, PageHeader, MatButtonModule, MatCardModule, MatIconModule, FullCalendarModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
})
export class CalendarioViajes {
  private readonly service = inject(ViajesService);
  private readonly router = inject(Router);

  isLoading = false;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, classicThemePlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    height: 'auto',
    displayEventEnd: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth',
    },
    events: [],
    datesSet: (arg: DatesSetInfo) => this.cargarViajes(arg),
    eventClick: (arg: EventClickInfo) => this.abrirDetalle(arg),
  };

  volverListado(): void {
    this.router.navigate(['/viajes/listar']);
  }

  private cargarViajes(arg: DatesSetInfo): void {
    this.isLoading = true;

    this.service.getViajesCalendario(arg.view.currentStart, arg.view.currentEnd).subscribe({
      next: viajes => {
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.mapearEventos(viajes),
        };
        this.isLoading = false;
      },
      error: error => {
        console.error('Error fetching calendar viajes:', error);
        this.calendarOptions = {
          ...this.calendarOptions,
          events: [],
        };
        this.isLoading = false;
      },
    });
  }

  private mapearEventos(viajes: ViajesCalendar[]): EventInput[] {
    return viajes.map(viaje => ({
      id: viaje.id,
      title: viaje.title || '',
      start: viaje.start,
      end: this.toExclusiveEnd(viaje.end),
      allDay: true,
    }));
  }

  private abrirDetalle(arg: EventClickInfo): void {
    const guid = arg.event.id;
    if (guid) {
      this.router.navigate(['/viajes/detalle', guid]);
    }
  }

  private toExclusiveEnd(end?: string): string | undefined {
    if (!end) {
      return undefined;
    }

    const date = new Date(end);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }
}