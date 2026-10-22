import { inject, Injectable } from '@angular/core';
import { ResponseRequest } from 'src/app/models/response-request';
import { AcuerdoModel, AcuerdoCreateModel } from 'src/app/models/acuerdos';
import { SolicitudAprobacionHistorial } from 'src/app/models/solicitud-aprobacion-historial';

import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AgreementsService {
  private apiUrl = `${environment.apiUrl2}/agreements/`;
  private http = inject(HttpClient);

  saveAgreement(agreement: AcuerdoModel): Observable<ResponseRequest> {
    //const previous_studies_states_id = 1;

    //console.log('agreement service', agreement);
    try {
      return this.http.post<ResponseRequest>(this.apiUrl, agreement);
    } catch (error) {
      console.log('Error en saveTipoDocAcuerdos', error);
      return this.http.post<ResponseRequest>(this.apiUrl, agreement);
    }
  }
  /*
    getAcuerdoById(id: number): Observable<AcuerdoModel> {
      return this.http.get<AcuerdoModel>(`${this.apiUrl}/${id}`);
    }
  */
  getAcuerdoByGuid(uuid: string): Observable<AcuerdoModel> {
    return this.http.get<AcuerdoModel>(`${this.apiUrl}${uuid}/detalle`);
  }

  getAcuerdoId(id: number): Observable<AcuerdoModel> {
    return this.http.get<AcuerdoModel>(`${this.apiUrl}${id}`);
  }

  getAcuerdoById(uuid: string): Observable<AcuerdoModel> {
    //console.log('URLLL', `${this.apiUrl}${uuid}/detalle`);

    return this.http.get(`${this.apiUrl}${uuid}/detalle`).pipe(
      catchError(err => {
        console.error('Error en getPorGuid acuerdo', err);
        return throwError(() => err);
      })
    );
  }

  updateAgreement(agreement: AcuerdoModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}${agreement.guid}`, agreement);
  }
}
