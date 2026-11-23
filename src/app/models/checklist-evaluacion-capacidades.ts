export class CheckDocumentsResponseModel {
  mensaje?: string;
  archivo?: any;
  guid?: string | null;
  identity?: number;
  ids_usuarios_notificar?: number[];
  solicitud_exitosa?: boolean;

  constructor(data?: Partial<CheckDocumentsResponseModel>) {
    Object.assign(this, data);
  }
}
