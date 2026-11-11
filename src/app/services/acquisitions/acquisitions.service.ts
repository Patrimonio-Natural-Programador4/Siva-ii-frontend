import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getAcquisitionsFilter(
    page = 1,
    filtro: string,
    pid = -1,
    actividad = -1,
    procesos: string[] = [],
    rubros: string[] = [],
    rubros_cortos: string[] = [],
    cod_actividad: string | null = null
  ): Observable<AcquisitionsListSP[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('filtro', filtro ?? '')
      .set('pid', (pid ?? -1).toString())
      .set('actividad', (actividad ?? -1).toString());
    console.log(
      `page ${page}, filtro ${filtro}, pid ${pid}, actividad ${actividad}, procesos ${procesos}, rubros ${rubros}, rubrosCortos ${rubros_cortos}`
    );

    if (procesos && procesos.length > 0) {
      procesos.forEach(p => {
        params = params.append('procesos', p);
      });
    }

    if (rubros && rubros.length > 0) {
      rubros.forEach(r => {
        params = params.append('rubros', r);
      });
    }

    if (rubros_cortos && rubros_cortos.length > 0) {
      rubros_cortos.forEach(rc => {
        params = params.append('rubros_cortos', rc);
      });
    }

    if (cod_actividad && cod_actividad.trim() !== '') {
      params = params.set('actividad_codigo', cod_actividad.trim());
    }

    return this.http.get<AcquisitionsListSP[]>(`${this.apiUrl}/filtro`, {
      params,
    });
  }
}
