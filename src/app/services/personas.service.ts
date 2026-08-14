import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ResponseRequest } from 'src/app/models/response-request';

import { PersonModel } from 'src/app/models/personas';

@Injectable({
  providedIn: 'root',
})
export class PersonsService {
  private apiUrl = `${environment.apiUrl2}/personas`;
  private http = inject(HttpClient);

  getPersons(): Observable<PersonModel[]> {
    return this.http.get<PersonModel[]>(this.apiUrl);
  }

  getPersonsById(id: number): Observable<PersonModel> {
    return this.http.get<PersonModel>(`${this.apiUrl}/${id}`);
  }

  savePersons(person: PersonModel): Observable<ResponseRequest> {
    return this.http.post<ResponseRequest>(this.apiUrl, person);
  }

  updatePersons(person: PersonModel): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${person.id}`, person);
  }
}
