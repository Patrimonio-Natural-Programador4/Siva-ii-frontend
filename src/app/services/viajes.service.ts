import { inject, Injectable } from '@angular/core';
import { Listados } from '../models/listados';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AccionesSolicitudAprobacion } from '../models/acciones-solicitud-aprobacion';
import { Viajes, ViajesCalendar } from '../models/viajes';
import { format } from 'date-fns/format';
import { ResponseRequest } from '../models/response-request';
import { SolicitudAprobacionHistorial } from '../models/solicitud-aprobacion-historial';
import { TravelLegalization } from '../models/travel-legalization';

@Injectable({
  providedIn: 'root',
})
export class ViajesService {
  private apiUrl = `${environment.apiUrl2}/viajes`;
  private readonly http = inject(HttpClient);

  getListados(): Observable<Listados[]> {
    return this.http.get<Listados[]>(`${this.apiUrl}/listados`);
  }
  saveViaje(viaje: Viajes): Observable<any> {
    const payload = {
      ...viaje,

      fecha_inicio_viaje: viaje.fecha_inicio_viaje
        ? format(viaje.fecha_inicio_viaje, 'yyyy-MM-dd')
        : null,

      fecha_fin_viaje: viaje.fecha_fin_viaje ? format(viaje.fecha_fin_viaje, 'yyyy-MM-dd') : null,

      fecha_nacimiento_viajero: viaje.fecha_nacimiento_viajero
        ? format(viaje.fecha_nacimiento_viajero, 'yyyy-MM-dd')
        : null,

      itinerario: viaje.itinerario?.map(i => ({
        ...i,
        fecha: i.fecha ? format(new Date(i.fecha), 'yyyy-MM-dd') : null,
      })),

      hotel: viaje.hotel?.map(h => ({
        ...h,
        fecha_llegada: h.fecha_llegada ? format(new Date(h.fecha_llegada), 'yyyy-MM-dd') : null,
        fecha_salida: h.fecha_salida ? format(new Date(h.fecha_salida), 'yyyy-MM-dd') : null,
      })),
    };
    return this.http.post<any>(this.apiUrl, payload);
  }
  updateViaje(viaje: Viajes): Observable<any> {
    const payload = {
      ...viaje,

      fecha_inicio_viaje: viaje.fecha_inicio_viaje
        ? format(viaje.fecha_inicio_viaje, 'yyyy-MM-dd')
        : null,

      fecha_fin_viaje: viaje.fecha_fin_viaje ? format(viaje.fecha_fin_viaje, 'yyyy-MM-dd') : null,

      itinerario: viaje.itinerario?.map(i => ({
        ...i,
        fecha: i.fecha ? format(new Date(i.fecha), 'yyyy-MM-dd') : null,
      })),

      hotel: viaje.hotel?.map(h => ({
        ...h,
        fecha_llegada: h.fecha_llegada ? format(new Date(h.fecha_llegada), 'yyyy-MM-dd') : null,
        fecha_salida: h.fecha_salida ? format(new Date(h.fecha_salida), 'yyyy-MM-dd') : null,
      })),
    };
    return this.http.put<any>(`${this.apiUrl}/${viaje.guid}`, payload);
  }

  getListadosListaViajes(): Observable<Listados[]> {
    return this.http.get<Listados[]>(`${this.apiUrl}/listados_viajes`);
  }
  getViajeById(id: string): Observable<Viajes> {
    return this.http.get<Viajes>(`${this.apiUrl}/${id}/detalle`);
  }

  getViajesCalendario(fechaDesde: Date, fechaHasta: Date): Observable<ViajesCalendar[]> {
    const params = new HttpParams()
      .set('fechaDesde', format(fechaDesde, 'yyyy-MM-dd'))
      .set('fechaHasta', format(fechaHasta, 'yyyy-MM-dd'));

    return this.http.get<ViajesCalendar[]>(`${this.apiUrl}/calendario`, { params });
  }

  getHistorialAprobacion(
    idRegistro: number | string,
    tipoSolicitud: string
  ): Observable<SolicitudAprobacionHistorial[]> {
    const params = new HttpParams()
      .set('guid', String(idRegistro))
      .set('tipo_solicitud', tipoSolicitud);

    return this.http.get<SolicitudAprobacionHistorial[]>(
      `${environment.apiUrl2}/solicitudes-aprobacion/historial_aprobacion`,
      { params }
    );
  }

  getViajesFiltro(
    page = 1,
    id_estado: number[] = [-1],
    filtro: string,
    fechaDesde: Date | null,
    fechaHasta: Date | null,
    programa: number | null = null
  ): Observable<Viajes[]> {
    let params = new HttpParams().set('page', page.toString()).set('filtro', filtro ?? '');

    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde.toISOString());
    }

    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta.toISOString());
    }

    if (!id_estado || id_estado.length === 0) {
      id_estado = [-1];
    }

    id_estado.forEach(id => {
      params = params.append('estado', id.toString());
    });
    if (programa !== null) {
      params = params.set('programa', programa.toString());
    }

    return this.http.get<Viajes[]>(`${this.apiUrl}`, { params });
  }

  getValidacionAccionesAprobacion(id: string, tipo: string): Observable<ResponseRequest> {
    return this.http.get<ResponseRequest>(
      `${this.apiUrl}/${id}/validar_acciones_aprobacion?tipo=${tipo}`
    );
  }

  accionSolicitudAprobacion(
    guid: string,
    accion: AccionesSolicitudAprobacion
  ): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(
      `${this.apiUrl}/${guid}/accion_solicitud_aprobacion`,
      accion
    );
  }

  getLegalizacionByTravelId(travelRequestId: number): Observable<TravelLegalization[]> {
    return this.http.get<TravelLegalization[]>(`${this.apiUrl}/legalizaciones/${travelRequestId}`);
  }

  guardarLegalizacion(payload: any): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(`${this.apiUrl}/legalizaciones/Legalizacion`, payload);
  }

  actualizarLegalizacion(legalizationId: number, payload: any): Observable<ResponseRequest> {
    return this.http.patch<ResponseRequest>(
      `${this.apiUrl}/legalizaciones/${legalizationId}`,
      payload
    );
  }
}
