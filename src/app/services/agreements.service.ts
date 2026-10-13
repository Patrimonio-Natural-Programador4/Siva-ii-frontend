import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AgreementsListSP } from '../models/agreements';

@Injectable({
  providedIn: 'root',
})
export class AgreementsService {
  private apiUrl = `${environment.apiUrl2}/agreements`;
  private readonly http = inject(HttpClient);

  getAgreements(
    page = 1,
    pageSize = 25,
    search = '',
    id_tipos: number[] = [],
    id_modalidades: number[] = [],
    id_pilares: number[] = [],
    anios: number[] = [],
    fases: string[] = [],
    id_etapas: number[] = [],
    prioridades: string[] = [],
    alertas: string[] = []
  ): Observable<AgreementsListSP[]> {
    let params = new HttpParams()
      .set('p_page', page.toString())
      .set('p_page_size', pageSize.toString());

    if (search) {
      params = params.set('p_search', search);
    }
    if (id_tipos && id_tipos.length > 0) {
      id_tipos.forEach(id => (params = params.append('p_type_ids', id.toString())));
    }
    if (id_modalidades && id_modalidades.length > 0) {
      id_modalidades.forEach(id => (params = params.append('p_modality_ids', id.toString())));
    }
    if (id_pilares && id_pilares.length > 0) {
      id_pilares.forEach(id => (params = params.append('p_pillar_ids', id.toString())));
    }
    if (anios && anios.length > 0) {
      anios.forEach(anio => (params = params.append('p_years', anio.toString())));
    }
    if (fases && fases.length > 0) {
      fases.forEach(fase => (params = params.append('p_phase', fase)));
    }
    if (id_etapas && id_etapas.length > 0) {
      id_etapas.forEach(id => (params = params.append('p_stage_ids', id.toString())));
    }
    if (prioridades && prioridades.length > 0) {
      prioridades.forEach(p => (params = params.append('p_priority', p)));
    }
    if (alertas && alertas.length > 0) {
      alertas.forEach(a => (params = params.append('p_alert', a)));
    }
    return this.http.get<AgreementsListSP[]>(`${this.apiUrl}/acuerdos/listar`, { params });
  }

  getListadosFiltros(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/listados`);
  }
}
