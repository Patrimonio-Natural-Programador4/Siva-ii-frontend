import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ResponseRequest } from 'src/app/models/response-request';

import { ModalidadModel } from 'src/app/models/modalidades';

@Injectable({
  providedIn: 'root',
})
export class ModalitiesService {
  private apiUrl = `${environment.apiUrl2}/modalidades`;
  private http = inject(HttpClient);

  getModalities(): Observable<ModalidadModel[]> {
    return this.http.get<ModalidadModel[]>(this.apiUrl);
  }

  getModalitiesById(id: number): Observable<ModalidadModel> {
    return this.http.get<ModalidadModel>(`${this.apiUrl}/${id}`);
  }

  saveModalities(modalidad: ModalidadModel): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, modalidad);
  }

  updateModalities(modalidad: ModalidadModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${modalidad.id}`, modalidad);
  }
}
