import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface ParametroDocumento {
  nombre: string;
  valor: string;
}

export interface ExtraccionParametrosResponse {
  parametros: ParametroDocumento[];
}

@Injectable({ providedIn: 'root' })
export class WordParametersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl2}/documentos/extraer-parametros`;

  extraerParametros(archivo: File): Observable<ExtraccionParametrosResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ExtraccionParametrosResponse>(this.apiUrl, formData);
  }
}