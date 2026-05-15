import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Listados } from '../models/listados';
import { Roles } from '../models/roles';
import { ResponseRequest } from '../models/response-request';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private apiUrl = `${environment.apiUrl2}/roles`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Roles[]> {
    return this.http.get<Roles[]>(this.apiUrl);
  }

  getListados(): Observable<Listados[]> {
    return this.http.get<Listados[]>(`${this.apiUrl}/listados`);
  }

  getControlesPorModulo(modulos: number[]): Observable<Listados[]> {
    const params = new HttpParams().set('ids', modulos.join(','));
    return this.http.get<Listados[]>(`${this.apiUrl}/controles-modulos`, { params });
  }

  getRolById(id: number): Observable<Roles> {
    return this.http.get<Roles>(`${this.apiUrl}/${id}`);
  }

  saveRol(rol: Roles): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, rol);
  }

  updateRol(rol: Roles): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${rol.id_rol}`, rol);
  }
}
