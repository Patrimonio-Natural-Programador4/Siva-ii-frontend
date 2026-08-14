import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ResponseRequest } from 'src/app/models/response-request';

import { ImplementerModel } from './../../models/implementers';

@Injectable({
  providedIn: 'root',
})
export class ImplementersService {
  private apiUrl = `${environment.apiUrl2}/implementadoras`;
  private http = inject(HttpClient);

  getImplementers(): Observable<ImplementerModel[]> {
    return this.http.get<ImplementerModel[]>(this.apiUrl);
  }

  getImplementersById(id: number): Observable<ImplementerModel> {
    return this.http.get<ImplementerModel>(`${this.apiUrl}/${id}`);
  }

  saveImplementers(implementer: ImplementerModel): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, implementer);
  }

  updateImplementers(implementer: ImplementerModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${implementer.id}`, implementer);
  }
}
