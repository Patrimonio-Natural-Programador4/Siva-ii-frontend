import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ResponseRequest } from 'src/app/models/response-request';

import { CapacityAssessmentStateModel } from 'src/app/models/estado-evaluacion-capacidades';
import { EvaluacionCapacidadesModel } from 'src/app/models/evaluacion-capacidades';

@Injectable({
  providedIn: 'root',
})
export class CapacityAssessmentStateService {
  private apiUrl = `${environment.apiUrl2}/estados-capacidades`;
  private http = inject(HttpClient);
  getCapStates(): Observable<CapacityAssessmentStateModel[]> {
    return this.http.get<CapacityAssessmentStateModel[]>(this.apiUrl);
  }

  getCapStatesById(id: number): Observable<CapacityAssessmentStateModel> {
    return this.http.get<CapacityAssessmentStateModel>(`${this.apiUrl}/${id}`);
  }

  saveCapStates(capstate: CapacityAssessmentStateModel): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, capstate);
  }

  updateCapStates(capstate: CapacityAssessmentStateModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${capstate.id}`, capstate);
  }
}
