import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, Subject } from 'rxjs';

import { TipoAcuerdoModel } from 'src/app/models/tipos-acuerdos';

@Injectable({
  providedIn: 'root',
})
export class AgreementTypes {
  private apiUrl = `${environment.apiUrl2}/tipos-acuerdos`;
  private http = inject(HttpClient);

  refrescarTabla$ = new Subject<void>();

  // Lista estudios previos
  getagreementTypes(): Observable<TipoAcuerdoModel[]> {
    return this.http.get<TipoAcuerdoModel[]>(this.apiUrl);
  }
}
