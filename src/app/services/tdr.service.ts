import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tdr } from '../models/tdr';
import { DynamicForm } from '../models/dynamic-form';

import { environment } from '@env/environment';
import { Listados } from '../models/listados';
import { ResponseRequest } from '../models/response-request';

@Injectable({
  providedIn: 'root',
})
export class TdrService {
  private apiUrl = `${environment.apiUrl2}/tdr`;

  constructor(private http: HttpClient) {}

  // getRoles(): Observable<Roles[]> {
  //   return this.http.get<Roles[]>(this.apiUrl);
  // }

  obtenerCamposTdr(approvalFlowId: number): Observable<DynamicForm> {
    return this.http.get<DynamicForm>(`${this.apiUrl}/campos_tdr`, {
      params: new HttpParams().set('approval_flow_id', approvalFlowId.toString()),
    });
  }

  getListados(): Observable<Listados[]> {
    return this.http.get<Listados[]>(`${this.apiUrl}/listados`);
  }

  // getControlesPorModulo(modulos: number[]): Observable<Listados[]> {
  //   const params = new HttpParams().set('ids', modulos.join(','));
  //   return this.http.get<Listados[]>(`${this.apiUrl}/controles-modulos`, { params });
  // }

  // getRolById(id: number): Observable<Roles> {
  //   return this.http.get<Roles>(`${this.apiUrl}/${id}`);
  // }

  saveTdr(tdr: Tdr): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, tdr);
  }

  previsualizarTdr(tdr: Tdr): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(`${this.apiUrl}/previsualizar`, tdr);
  }

  updateTdr(tdr: Tdr): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${tdr.guid}`, tdr);
  }
}
