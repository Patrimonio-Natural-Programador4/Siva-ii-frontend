import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, Subject } from 'rxjs';

import { TipoDocumentoAcuerdoModel } from 'src/app/models/tipos-documento-acuerdos';
import { ResponseRequest } from 'src/app/models/response-request';

@Injectable({
  providedIn: 'root',
})
export class TiposDocumentoAcuerdosService {
  private sufixurl = 'tipos-documentos-acuerdos';
  private apiUrl = `${environment.apiUrl2}/tipos-documentos-acuerdos`;
  private http = inject(HttpClient);

  refrescarTabla$ = new Subject<void>();

  // Lista tipos documentos acuerdos
  getTipoDocAcuerdos(): Observable<TipoDocumentoAcuerdoModel[]> {
    return this.http.get<TipoDocumentoAcuerdoModel[]>(this.apiUrl);
  }

  //Tipo documento acuerdo por id
  getTipoDocAcuerdosById(id: number): Observable<TipoDocumentoAcuerdoModel> {
    return this.http.get<TipoDocumentoAcuerdoModel>(`${this.apiUrl}/${id}`);
  }

  // Guardar Tipo documento acuerdo
  saveTipoDocAcuerdos(tipo_doc: TipoDocumentoAcuerdoModel): Observable<ResponseRequest> {
    try {
      return this.http.post<ResponseRequest>(this.apiUrl, tipo_doc);
    } catch (error) {
      console.log('Error en saveTipoDocAcuerdos', error);
      return this.http.post<ResponseRequest>(this.apiUrl, tipo_doc);
    }
  }

  // Actualizar Tipo documento acuerdo
  updateTipoDocAcuerdos(tipo_doc: TipoDocumentoAcuerdoModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${tipo_doc.id}`, tipo_doc);
  }
}
