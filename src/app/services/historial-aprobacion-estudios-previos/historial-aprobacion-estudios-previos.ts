import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { FlujoPreviousStudiesListModel } from 'src/app/models/flujos-estudios-previos';

@Injectable({
  providedIn: 'root',
})
export class HistorialAprobacionEstudiosPrevios {
  private apiUrl = `${environment.apiUrl2}/solicitudes-aprobacion/historial-aprobacion-estudios-previos`;
  private http = inject(HttpClient);

  getFlujoEstudiosPrevios(): Observable<FlujoPreviousStudiesListModel[]> {
    return this.http.get<FlujoPreviousStudiesListModel[]>(this.apiUrl);
  }
}
// this.flujosTable.data
