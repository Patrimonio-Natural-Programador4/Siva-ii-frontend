export class ResponseRequest {
  mensaje?: string;
  identity?: number;
  solicitud_exitosa?: boolean;
  guid?: string;
  ids_usuarios_notificar?: number[];

  constructor(data?: Partial<ResponseRequest>) {
    this.ids_usuarios_notificar = [];
    Object.assign(this, data);
  }
}
