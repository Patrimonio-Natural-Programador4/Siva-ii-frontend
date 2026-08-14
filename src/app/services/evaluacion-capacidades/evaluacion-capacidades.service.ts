import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, Subject } from 'rxjs';
import { ResponseRequest } from 'src/app/models/response-request';

import { EvaluacionCapacidadesModel } from 'src/app/models/evaluacion-capacidades';

@Injectable({
  providedIn: 'root',
})
export class EvaluacionCapacidadesService {
  private apiUrl = `${environment.apiUrl2}/evaluaciones-de-capacidades`;
  private http = inject(HttpClient);

  refrescarTabla$ = new Subject<void>();

  // Lista evaluacion capacidades
  getEvaCapacidades(): Observable<EvaluacionCapacidadesModel[]> {
    return this.http.get<EvaluacionCapacidadesModel[]>(this.apiUrl);
  }

  //Evaluacion capacidades por id
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

  updateEvaCapacidades(evCap: EvaluacionCapacidadesModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${evCap.id}`, evCap);
  }
}
