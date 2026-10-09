export interface TravelLegalization {
  legalization_id?: number;
  travel_request_id: number;
  check_date: string | Date;
  check_number?: string | null;
  beneficiary: string;
  nit_beneficiary: string;
  concept_id?: number | null;
  concept_name?: string | null;
  observations_outlay?: string | null;
  regimen_type_id: number;
  regimen_name?: string | null;
  subtotal: number;
  iva: number;
  retention_porcentage: number;
  retention: number;
  amount_paid: number;
  observations?: string | null;
  created_at?: string | Date;
}
