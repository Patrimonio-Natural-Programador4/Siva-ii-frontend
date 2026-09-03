import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Subject, Observable } from 'rxjs';
import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { ResponseRequest } from 'src/app/models/response-request';
import { Viajes } from 'src/app/models/viajes';

@Injectable({
  providedIn: 'root',
})
export class EstudiosPreviosService {
  private apiUrl = `${environment.apiUrl2}/estudios-previos`;
  private http = inject(HttpClient);

  refrescarTabla$ = new Subject<void>();

  // Lista estudios previos
  getEstPrevios(): Observable<PreviousStudiesModel[]> {
    return this.http.get<PreviousStudiesModel[]>(this.apiUrl);
  }

  //Evaluacion capacidades por id
  getEstPreviosById(id: number): Observable<PreviousStudiesModel> {
    return this.http.get<PreviousStudiesModel>(`${this.apiUrl}/${id}`);
  }

  saveEstPrevios(evCap: PreviousStudiesModel): Observable<ResponseRequest> {
    try {
      return this.http.post<ResponseRequest>(this.apiUrl, evCap);
    } catch (error) {
      console.log('Error en saveTipoDocAcuerdos', error);
      return this.http.post<ResponseRequest>(this.apiUrl, evCap);
    }
  }

  updateEstPrevios(evCap: PreviousStudiesModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${evCap.id}`, evCap);
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
}
