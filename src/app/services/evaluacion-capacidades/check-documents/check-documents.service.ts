import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { CheckDocumentsResponseModel } from 'src/app/models/checklist-evaluacion-capacidades';

@Injectable({
  providedIn: 'root',
})
export class CheckDocumentsService {
  private apiUrl = `${environment.apiUrl2}/tipo-documentos-evaluacion-capacidades`;
  private http = inject(HttpClient);

  getCheckDocuments(): Observable<CheckDocumentsResponseModel> {
    return this.http.get<CheckDocumentsResponseModel>(this.apiUrl);
  }
}
