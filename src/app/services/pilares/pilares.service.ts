import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

import { PilarModel } from '../../models/pilares';

@Injectable({
  providedIn: 'root',
})
export class PilaresService {
  private apiUrl = `${environment.apiUrl2}/pilares`;
  private http = inject(HttpClient);

  getPilars(): Observable<PilarModel[]> {
    return this.http.get<PilarModel[]>(this.apiUrl);
  }
}
