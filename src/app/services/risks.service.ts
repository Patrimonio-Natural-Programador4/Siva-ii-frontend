import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

import { ResponseRequest } from 'src/app/models/response-request';
import { RisksModel } from '../models/risks';

@Injectable({ providedIn: 'root' })
export class RisksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl2}/riesgos`;

  get_by_previous_studies(idEstudioPrevio: number): Observable<RisksModel[]> {
    return this.http.get<RisksModel[]>(`${this.baseUrl}/estudio-previo/${idEstudioPrevio}`);
  }

  get_by_Id(id: number): Observable<RisksModel> {
    return this.http.get<RisksModel>(`${this.baseUrl}/${id}`);
  }

  save_risk(riesgo: RisksModel): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.baseUrl, riesgo);
  }

  update_risk(riesgo: RisksModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.baseUrl}/${riesgo.id}`, riesgo);
  }
}
