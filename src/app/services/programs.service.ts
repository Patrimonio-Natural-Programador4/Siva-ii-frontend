import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Programs } from '../models/programs';
import { ResponseRequest } from '../models/response-request';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private apiUrl = `${environment.apiUrl2}/programas`;

  constructor(private http: HttpClient) {}

  getPrograms(): Observable<Programs[]> {
    return this.http.get<Programs[]>(this.apiUrl);
  }

  getProgramById(id: number): Observable<Programs> {
    return this.http.get<Programs>(`${this.apiUrl}/${id}`);
  }

  saveProgram(programa: Programs): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, programa);
  }

  updateProgram(programa: Programs): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${programa.id_programa}`, programa);
  }
}
