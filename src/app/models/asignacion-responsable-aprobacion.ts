export interface UsuarioAsignableAprobacion {
  user_id: number;
  name: string;
  email: string;
}

export interface AsignacionResponsableAprobacion {
  history_id: number;
  approval_role_id: number;
  role_name: string;
  step_order: number;
  assigned_user_id: number | null;
  users: UsuarioAsignableAprobacion[];
}

export interface AsignarResponsableAprobacionRequest {
  history_id: number;
  user_id: number;
}
