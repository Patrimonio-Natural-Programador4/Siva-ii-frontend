import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '@env/environment';
import {
  AcquisitionsModel,
  AcquisitionsListSP,
  FiltrosAdquisicionSP,
} from 'src/app/models/acquisitions';

@Injectable({
  providedIn: 'root',
})
export class AcquisitionsService {
  private apiUrl = `${environment.apiUrl2}/adquisiciones`;
  private http = inject(HttpClient);
  //private readonly tipoSolicitud = 'APP_EP';

  refreshTable$ = new Subject<void>();

  getAcquisitions(): Observable<AcquisitionsModel[]> {
    return this.http.get<AcquisitionsModel[]>(this.apiUrl);
  }

  getAcquisitionsById(id: number): Observable<AcquisitionsModel> {
    return this.http.get<AcquisitionsModel>(`${this.apiUrl}/${id}`);
  }

  /*getEstudiosPreviosFiltro(
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
 
   getPorGuid(guid: string): Observable<PreviousStudiesModel> {
     console.log('URLLL', `${this.apiUrl}/${guid}/detalle`);
 
     return this.http.get(`${this.apiUrl}/${guid}/detalle`).pipe(
       catchError(err => {
         console.error('Error en getPorGuid', err);
         return throwError(() => err);
       })
     );
   }*/
}
