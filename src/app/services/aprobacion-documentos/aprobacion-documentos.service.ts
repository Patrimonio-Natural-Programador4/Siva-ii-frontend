// servicios de aprobacion de documentos

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { AprobacionDocumentos } from 'src/app/models/aprobacion-documentos';
import { ResponseRequest } from 'src/app/models/response-request';

@Injectable({
  providedIn: 'root',
})
export class AprobacionDocumentosService {
  private apiUrl = `${environment.apiUrl2}/aprobacion-documentos`;

  private http = inject(HttpClient);

  // Lista documentos
  getAprobDoc(): Observable<AprobacionDocumentos[]> {
    return this.http.get<AprobacionDocumentos[]>(this.apiUrl);
  }

  //documento por id
  getDocById(id: number): Observable<AprobacionDocumentos> {
    return this.http.get<AprobacionDocumentos>(`${this.apiUrl}/${id}`);
  }

  // Guardar documento
  saveDocument(documento: AprobacionDocumentos): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, documento);
  }

  // Actualizar documento
  updateDoc(documento: AprobacionDocumentos): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${documento.id}`, documento);
  }
}
