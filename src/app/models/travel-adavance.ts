export class TravelAdvance {
    travel_advance_id?: number;
    expense_advance_concept_id?: number;
    amount?: number;
    observations?: string;
    concept?: string;
    constructor(data?: Partial<TravelAdvance>) {
    Object.assign(this, data);
  }
}