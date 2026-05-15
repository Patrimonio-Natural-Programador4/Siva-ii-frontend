import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { DelegacionRolesUsuarios } from '../models/delegacion-roles-usuarios';
import { FlujosAprobacion } from '../models/flujos-aprobacion';
import { Listados } from '../models/listados';
import { ResponseRequest } from '../models/response-request';
import { RolesAprobacion } from '../models/roles-aprobacion';

@Injectable({
  providedIn: 'root',
})
export class FlujosAprobacionService {
  private readonly apiUrl = `${environment.apiUrl2}/flujos-aprobacion`;

  constructor(private readonly http: HttpClient) {}

  getRolesAprobacion(): Observable<RolesAprobacion[]> {
    return this.http.get<RolesAprobacion[]>(`${this.apiUrl}/roles`);
  }

  getRolById(id: number): Observable<RolesAprobacion> {
    return this.http.get<RolesAprobacion>(`${this.apiUrl}/roles/${id}`);
  }

  getListadosRoles(): Observable<Listados[]> {
    return this.http.get<Listados[]>(`${this.apiUrl}/roles/listados`);
  }

  saveRol(rol: RolesAprobacion): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(`${this.apiUrl}/roles`, rol);
  }

  updateRol(rol: RolesAprobacion): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/roles/${rol.id_rol_aprobacion}`, rol);
  }

  getFlujosAprobacion(): Observable<FlujosAprobacion[]> {
    return this.http.get<FlujosAprobacion[]>(this.apiUrl);
  }

  getFlujoById(id: number): Observable<FlujosAprobacion> {
    return this.http.get<FlujosAprobacion>(`${this.apiUrl}/${id}`);
  }

  getListadosFlujos(): Observable<Listados[]> {
    return this.http.get<Listados[]>(`${this.apiUrl}/listados`);
  }

  saveFlujo(flujo: FlujosAprobacion): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, flujo);
  }

  updateFlujo(flujo: FlujosAprobacion): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${flujo.id_flujo_aprobacion}`, flujo);
  }

  getDelegaciones(): Observable<DelegacionRolesUsuarios[]> {
    return this.http.get<DelegacionRolesUsuarios[]>(`${this.apiUrl}/delegaciones`);
  }

  getDelegacionById(id: number): Observable<DelegacionRolesUsuarios> {
    return this.http.get<DelegacionRolesUsuarios>(`${this.apiUrl}/delegaciones/${id}`);
  }

  getListadosDelegacion(idDelegacion: number): Observable<Listados[]> {
    return this.http.get<Listados[]>(`${this.apiUrl}/delegaciones/listados/${idDelegacion}`);
  }

  saveDelegacion(delegacion: DelegacionRolesUsuarios): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(`${this.apiUrl}/delegaciones`, delegacion);
  }

  updateDelegacion(delegacion: DelegacionRolesUsuarios): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/delegaciones`, delegacion);
  }
}