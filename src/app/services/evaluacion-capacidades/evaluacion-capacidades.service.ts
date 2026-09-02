import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

import {
  AccionSolicitudAprobacionCapacidad,
  EvaluacionCapacidadesModel,
  EvaluacionCapacidadListSP,
} from 'src/app/models/evaluacion-capacidades';
import { ResponseRequest } from 'src/app/models/response-request';
import { SolicitudAprobacionHistorial } from 'src/app/models/solicitud-aprobacion-historial';
import { AccionesSolicitudAprobacion } from 'src/app/models/acciones-solicitud-aprobacion';

@Injectable({ providedIn: 'root' })
export class EvaluacionCapacidadesService {
  private apiUrl = `${environment.apiUrl2}/evaluaciones-de-capacidades`;
  private http = inject(HttpClient);
  private readonly tipoSolicitud = 'APP_EC';

  getEvaCapacidades(): Observable<EvaluacionCapacidadesModel[]> {
    return this.http.get<EvaluacionCapacidadesModel[]>(this.apiUrl);
  }
  getEvaCapacidadesById(id: number): Observable<EvaluacionCapacidadesModel> {
    return this.http.get<EvaluacionCapacidadesModel>(`${this.apiUrl}/${id}`);
  }

  saveEvaCapacidades(evCap: EvaluacionCapacidadesModel): Observable<ResponseRequest> {
    try {
      return this.http.post<ResponseRequest>(this.apiUrl, evCap);
    } catch (error) {
      console.log('Error en saveTipoDocAcuerdos', error);
      return this.http.post<ResponseRequest>(this.apiUrl, evCap);
    }
  }

  updateEvaCapacidades(guid: string, evCap: any): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${guid}`, evCap);
  }
  getListado(
    page = 1,
    idEstado: number[] = [-1],
    filtro = '',
    programa: number | null = null
  ): Observable<EvaluacionCapacidadListSP[]> {
    let params = new HttpParams().set('page', page.toString()).set('filtro', filtro ?? '');
    (idEstado.length ? idEstado : [-1]).forEach(id => {
      params = params.append('estado', id.toString());
    });
    if (programa !== null) {
      params = params.set('programa', programa.toString());
    }
    return this.http.get<EvaluacionCapacidadListSP[]>(`${this.apiUrl}/filtro`, { params });
  }

  getPorGuid(guid: string): Observable<EvaluacionCapacidadesModel> {
    return this.http.get<EvaluacionCapacidadesModel>(`${this.apiUrl}/${guid}/detalle`);
  }

  getHistorialAprobacion(idEvaluacion: number): Observable<SolicitudAprobacionHistorial[]> {
    const params = new HttpParams()
      .set('guid', String(idEvaluacion))
      .set('tipo_solicitud', this.tipoSolicitud);
    return this.http.get<SolicitudAprobacionHistorial[]>(
      `${environment.apiUrl2}/solicitudes-aprobacion/historial_aprobacion`,
      { params }
    );
  }

  getValidacionAccionesAprobacion(guid: string): Observable<ResponseRequest> {
    return this.http.get<ResponseRequest>(`${this.apiUrl}/${guid}/validar_acciones_aprobacion`);
  }

  // accionSolicitudAprobacion2(
  //   guid: string,
  //   accion: AccionSolicitudAprobacionCapacidad
  // ): Observable<ResponseRequest> {
  //   return this.http.post<ResponseRequest>(
  //     `${this.apiUrl}/${guid}/accion_solicitud_aprobacion`,
  //     accion
  //   );
  // }

  accionSolicitudAprobacion(
    guid: string,
    accion: AccionesSolicitudAprobacion
  ): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(
      `${this.apiUrl}/${guid}/accion_solicitud_aprobacion`,
      accion
    );
  }

  getEvaluacionCapacidadesFiltro(
    page = 1,
    id_estado: number[] = [-1],
    filtro: string,
    programa: number[] = []
  ): Observable<EvaluacionCapacidadesModel[]> {
    let params = new HttpParams().set('page', page.toString()).set('filtro', filtro ?? '');
    console.log(`page ${page}, id_estado ${id_estado} , filtro ${filtro} , programa ${programa} `);

    if (!id_estado || id_estado.length === 0) {
      id_estado = [-1];
    }

    id_estado.forEach(id => {
      params = params.append('estado', id.toString());
    });
    if (programa && programa.length > 0) {
      programa.forEach(id => {
        params = params.append('programa', id.toString());
      });
    }

    return this.http.get<EvaluacionCapacidadesModel[]>(`${this.apiUrl}/filtro-test`, {
      params,
    });
  }
}
