import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Subject, Observable } from 'rxjs';
import { PreviousStudiesModel } from 'src/app/models/estudios-previos';
import { ResponseRequest } from 'src/app/models/response-request';

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
}
