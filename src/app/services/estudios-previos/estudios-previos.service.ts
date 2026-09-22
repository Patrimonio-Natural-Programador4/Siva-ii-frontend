import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Subject, Observable, catchError, throwError } from 'rxjs';
import { AccionesSolicitudAprobacion } from 'src/app/models/acciones-solicitud-aprobacion';
import { PreviousStudiesListModel, PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { ResponseRequest } from 'src/app/models/response-request';
import { SolicitudAprobacionHistorial } from 'src/app/models/solicitud-aprobacion-historial';
import { Viajes } from 'src/app/models/viajes';

@Injectable({
  providedIn: 'root',
})
export class EstudiosPreviosService {
  private apiUrl = `${environment.apiUrl2}/estudios-previos`;
  private http = inject(HttpClient);
  private readonly tipoSolicitud = 'APP_EP';

  refrescarTabla$ = new Subject<void>();

  // Lista estudios previos
  getEstPrevios(): Observable<PreviousStudiesModel[]> {
    return this.http.get<PreviousStudiesModel[]>(this.apiUrl);
  }

  //Evaluacion capacidades por id
  getEstPreviosById(id: number): Observable<PreviousStudiesModel> {
    return this.http.get<PreviousStudiesModel>(`${this.apiUrl}/${id}`);
  }

  saveEstPrevios(est_prev: PreviousStudiesModel): Observable<ResponseRequest> {
    const previous_studies_states_id = 1;
    est_prev = { ...est_prev, previous_studies_states_id };
    console.log('estado', est_prev);
    try {
      return this.http.post<ResponseRequest>(this.apiUrl, est_prev);
    } catch (error) {
      console.log('Error en saveTipoDocAcuerdos', error);
      return this.http.post<ResponseRequest>(this.apiUrl, est_prev);
    }
  }

  updateEstPrevios(est_prev: PreviousStudiesModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${est_prev.id}`, est_prev);
  }

  getEstudiosPreviosFiltro(
    page = 1,
    id_estado: number[] = [-1],
    filtro: string,
    programa: number | null = null
  ): Observable<PreviousStudiesModel[]> {
    let params = new HttpParams().set('page', page.toString()).set('filtro', filtro ?? '');

    if (!id_estado || id_estado.length === 0) {
      id_estado = [-1];
    }

    id_estado.forEach(id => {
      params = params.append('estado', id.toString());
    });
    if (programa !== null) {
      params = params.set('programa', programa.toString());
    }

    return this.http.get<PreviousStudiesModel[]>(`${this.apiUrl}`, { params });
  }

  getPorGuid(guid: string): Observable<PreviousStudiesModel> {
    console.log('URLLL', `${this.apiUrl}/${guid}/detalle`);

    return this.http.get(`${this.apiUrl}/${guid}/detalle`).pipe(
      catchError(err => {
        console.error('Error en getPorGuid', err);
        return throwError(() => err);
      })
    );
  }

  getHistorialAprobacion(idEstudio: number): Observable<SolicitudAprobacionHistorial[]> {
    const params = new HttpParams()
      .set('guid', String(idEstudio))
      .set('tipo_solicitud', this.tipoSolicitud);
    return this.http.get<SolicitudAprobacionHistorial[]>(
      `${environment.apiUrl2}/solicitudes-aprobacion/historial_aprobacion`,
      { params }
    );
  }

  getValidacionAccionesAprobacion(guid: string): Observable<ResponseRequest> {
    return this.http.get<ResponseRequest>(`${this.apiUrl}/${guid}/validar_acciones_aprobacion`);
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

  getListado(
    page = 1,
    idEstado: number[] = [-1],
    filtro = '',
    programa: number | null = null
  ): Observable<PreviousStudiesListModel[]> {
    let params = new HttpParams().set('page', page.toString()).set('filtro', filtro ?? '');
    (idEstado.length ? idEstado : [-1]).forEach(id => {
      params = params.append('estado', id.toString());
    });
    if (programa !== null) {
      params = params.set('programa', programa.toString());
    }
    return this.http.get<PreviousStudiesListModel[]>(`${this.apiUrl}/filtro`, { params });
  }
}
