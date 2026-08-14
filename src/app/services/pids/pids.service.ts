import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ResponseRequest } from 'src/app/models/response-request';

import { PidModel } from './../../models/pids';

@Injectable({
  providedIn: 'root',
})
export class PidsService {
  private apiUrl = `${environment.apiUrl2}/pids`;
  private http = inject(HttpClient);
  getPids(): Observable<PidModel[]> {
    return this.http.get<PidModel[]>(this.apiUrl);
  }

  getPidsById(id: number): Observable<PidModel> {
    return this.http.get<PidModel>(`${this.apiUrl}/${id}`);
  }

  savePids(pid: PidModel): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, pid);
  }

  updatePids(pid: PidModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${pid.id}`, pid);
  }
}
