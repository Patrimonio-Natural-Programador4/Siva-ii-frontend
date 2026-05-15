// src/app/services/credit-card.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Usuarios } from '../models/usuarios';
import { ResponseRequest } from '../models/response-request';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl2}/usuarios`; // Update with your API URL

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(`${this.apiUrl}`);
  }

//   getUsuariosMSF(): Observable<UsuariosMsf[]> {
//     return this.http.get<UsuariosMsf[]>(`${this.apiUrl}/msf`);
//   }

//   getListados(): Observable<Listados[]> {
//     return this.http.get<Listados[]>(`${this.apiUrl}/listados`);
//   }

//   validarAcceso(): Observable<ResponseRequest> {
//     return this.http.get<ResponseRequest>(`${this.apiUrl}/validar_acceso`);
//   }
//   getMenu(): Observable<Menu[]> {
//     return this.http.get<Menu[]>(`${this.apiUrl}/menu`);
//   }
//   // public createUsuario(usuario: Usuarios): Observable<any> {
//   //   return this.http.post<any>(this.apiUrl, usuario);
//   // }
//   // createUserMember(): Observable<Usuarios[]> {
//   //   return this.http.get<Usuarios[]>(`${this.apiUrl}/invite`);
//   // }
  getUsuarioById(guid: string): Observable<Usuarios> {
    return this.http.get<Usuarios>(`${this.apiUrl}/${guid}`);
  }

//   buscarUsuarioXDocumento(numero_documento: number): Observable<Usuarios> {
//     return this.http.get<Usuarios>(`${this.apiUrl}/documento/${numero_documento}`);
//   }
//   validarCorreo(correo: string): Observable<Usuarios> {
//     return this.http.get<Usuarios>(`${this.apiUrl}/validar_correo/${correo}`);
//   }

  validarCorreoEnGrupo(correo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validar_correo_grupo/${correo}`);
  }

  validarUsuarioCorporativo(guid: string, datosValidacion: any): Observable<unknown> {
    return this.http.put<unknown>(`${this.apiUrl}/validar_usuario/${guid}`, datosValidacion);
  }

  actualizarUsuario(guid: string, usuario: Usuarios): Observable<ResponseRequest> {
    return this.http.put<ResponseRequest>(`${this.apiUrl}/${guid}`, usuario);
  }

//   saveUsuario(usuario: Usuarios): Observable<any> {
//     return this.http.post<any>(this.apiUrl, usuario);
//   }
//   updateUsuario(usuario: Usuarios): Observable<any> {
//     return this.http.put<any>(`${this.apiUrl}/${usuario.guid}`, usuario);
//   }
}
