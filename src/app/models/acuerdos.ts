export class AcuerdoModel {
  id?: number; // NOT NULL (lo genera la BD)
  name?: string | null;
  code?: string | null; // corregido: era "codee"
  local?: number | null; // en BD es integer
  description?: string | null;
  value?: number | null;
  is_currency_usd?: boolean; // NOT NULL
  year?: number | null;
  request_date?: string | Date | null;
  finish_date?: string | Date | null;
  signature_fpn?: string | Date | null;
  signature_ei?: string | Date | null;
  file_date?: string | Date | null;
  policy_approval?: boolean; // NOT NULL
  signature_date?: string | Date | null;
  time_limit?: string | null;
  policy_date?: string | Date | null;
  liquidation_date?: string | Date | null;
  final_date?: string | Date | null;

  // foráneas
  agreement_id?: number | null;
  program_id?: number | null;
  pillar_id?: number | null;
  agreement_type_id?: number | null;
  agreement_stage_id?: number | null;
  agreement_origin_id?: number | null;
  region_id?: number | null;
  modality_id?: number | null;
  capacity_assessment_id?: number | null; // existía en BD y faltaba en el modelo
  prevou_study_id?: number | null;

  marking?: string | null;
  priority?: string | null;
  notes?: string | null;
  is_valid?: boolean | null;
  observations?: string | null;
  products?: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  alert?: string | null;
  liquidation_file_date?: string | Date | null;
  finish_file_record_date?: string | Date | null;
  general_remarks?: string | null;
  email_notifications?: string | null;
  executed_value?: number | null;
  financial_progress?: number | null;
  summary?: string | null;
  total_value?: number | null;
  financial_cutoff_date?: string | Date | null;
  value_executes_fpn?: number | null;
  value_executes_entity?: number | null;
  counterpart_execution_progress?: number | null;
  ei_executed_value?: number | null;
  fpn_executed_value?: number | null;
  total_value_executes_FPN?: number | null;
  total_value_executes_EI?: number | null;
  last_report_date?: string | Date | null;
  contract_file_sharepoint?: string | null;
  shared_ei_one_drive?: string | null;
  shared_products_ei_one_drive?: string | null;
  village?: string | null;
  hectares?: number | null;
  beneficiaries?: number | null;
  advance_hectares?: number | null;
  advance_beneficiaries?: number | null;
  hectares_beneficiaries_updated_at?: string | Date | null;
  have_aatis?: boolean | null;
  aatis?: string | null;
  councils?: string | null;
  resguard?: string | null;
  municipality?: string | null;
  department?: string | null;
  legal_observations?: string | null;
  acquisitions_observations?: string | null;
  uer_observations?: string | null;

  // campos E.P
  precedents?: string | null;
  justification?: string | null;
  scope?: string | null;

  guid?: string | null;

  // solo lectura (vienen de joins, no son columnas de agreements)
  program?: string;
  pillar?: string;
  agreement_type?: string;
  agreement_stage?: string;
  agreement_origin_name?: string;
  modality?: string;
  region?: string;
  previous_study?: string;

  constructor(data?: Partial<AcuerdoModel>) {
    Object.assign(this, data);
  }
}

export class AcuerdoCreateModel {
  id?: number;
  name?: string;
  codee?: string;
  local?: string;
  description?: string;
  value?: number;
  is_currency_usd?: boolean;
  year?: number;
  request_date?: string | Date;
  finish_date?: string | Date;
  signature_fpn?: string | Date;
  signature_ei?: string | Date;
  file_date?: string | Date;
  policy_approval?: boolean;
  signature_date?: string | Date;
  time_limit?: string;
  policy_date?: string | Date;
  liquidation_date?: string | Date;
  final_date?: string | Date;
  agreement_id?: number;
  program_id?: number;
  program?: string;
  pillar_id?: number;
  pillar?: string;
  agreement_type_id?: number;
  agreement_type?: string;
  agreement_stage_id?: number;
  agreement_stage?: string;
  agreement_origin_id?: number;
  agreement_origin_name?: string;
  region_id?: number;
  marking?: string;
  priority?: string;
  notes?: string;
  is_valid?: boolean;
  observations?: string;
  products?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  alert?: string;
  liquidation_file_date?: string | Date;
  finish_file_record_date?: string | Date;
  general_remarks?: string;
  modality_id?: number;
  modality?: string;
  email_notifications?: string;
  executed_value?: number;
  financial_progress?: number;
  summary?: string;
  total_value?: number;
  financial_cutoff_date?: string | Date;
  value_executes_fpn?: number;
  value_executes_entity?: number;
  counterpart_execution_progress?: number;
  ei_executed_value?: number;
  fpn_executed_value?: number;
  total_value_executes_FPN?: number;
  total_value_executes_EI?: number;
  last_report_date?: string | Date;
  contract_file_sharepoint?: string;
  shared_ei_one_drive?: string;
  shared_products_ei_one_drive?: string;
  village?: string;
  hectares?: number;
  beneficiaries?: number;
  advance_hectares?: number;
  advance_beneficiaries?: number;
  hectares_beneficiaries_updated_at?: string | Date;
  have_aatis?: boolean;
  aatis?: string;
  councils?: string;
  resguard?: string;
  municipality?: string;
  department?: string;
  legal_observations?: string;
  acquisitions_observations?: string;
  uer_observations?: string;
  region?: string;
  precedents?: string;
  justification?: string;
  scope?: string;
  prevou_study_id?: number;
  previous_study?: string;

  constructor(data?: Partial<AcuerdoCreateModel>) {
    Object.assign(this, data);
  }
}
