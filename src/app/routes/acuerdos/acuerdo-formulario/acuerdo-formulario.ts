import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeader } from '@shared';
import { ResponseRequest } from 'src/app/models/response-request';

import { AgreementsService } from 'src/app/services/agreements/agreements';
import { AcuerdoModel, AcuerdoCreateModel } from 'src/app/models/acuerdos';

@Component({
  selector: 'app-acuerdo-formulario',
  imports: [
    PageHeader,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule,
  ],
  templateUrl: './acuerdo-formulario.html',
  styleUrl: './acuerdo-formulario.scss',
})
export class AcuerdoFormulario implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly AgreementsService = inject(AgreementsService);
  accion = 'Nuevo';
  guidAcuerdo: string | null = null;
  isLoading = false;

  acuerdoData: AcuerdoModel = new AcuerdoModel({
    name: '',
    code: '',
    local: null,
    description: '',
    value: 0,
    is_currency_usd: false,
    year: null,
    request_date: null,
    finish_date: null,
    signature_fpn: null,
    signature_ei: null,
    file_date: null,
    policy_approval: false,
    signature_date: null,
    time_limit: '',
    policy_date: null,
    liquidation_date: null,
    final_date: null,

    // foráneas
    agreement_id: null,
    program_id: null,
    pillar_id: null,
    agreement_type_id: null,
    agreement_stage_id: null,
    agreement_origin_id: null,
    region_id: null,
    modality_id: null,
    capacity_assessment_id: null,
    prevou_study_id: null,

    marking: '',
    priority: '',
    notes: '',
    is_valid: false,
    observations: '',
    products: '',
    alert: '',
    liquidation_file_date: null,
    finish_file_record_date: null,
    general_remarks: '',
    email_notifications: '',
    executed_value: 0,
    financial_progress: 0,
    summary: '',
    total_value: 0,
    financial_cutoff_date: null,
    value_executes_fpn: 0,
    value_executes_entity: 0,
    counterpart_execution_progress: 0,
    ei_executed_value: 0,
    fpn_executed_value: 0,
    total_value_executes_FPN: 0,
    total_value_executes_EI: 0,
    last_report_date: null,
    contract_file_sharepoint: '',
    shared_ei_one_drive: '',
    shared_products_ei_one_drive: '',
    village: '',
    hectares: 0,
    beneficiaries: 0,
    advance_hectares: 0,
    advance_beneficiaries: 0,
    hectares_beneficiaries_updated_at: null,
    have_aatis: false,
    aatis: '',
    councils: '',
    resguard: '',
    municipality: '',
    department: '',
    legal_observations: '',
    acquisitions_observations: '',
    uer_observations: '',

    // campos E.P
    precedents: '',
    justification: '',
    scope: '',
  });

  responseRequest: ResponseRequest = new ResponseRequest({
    mensaje: '',
    identity: undefined,
    solicitud_exitosa: false,
  });

  ngOnInit(): void {
    const guidParam = this.activatedRoute.snapshot.params['guid'];
    this.guidAcuerdo = guidParam ?? null;
    this.accion = this.guidAcuerdo ? 'Editar' : 'Nuevo';
    //console.log("Que accion  seria " , this.accion);

    if (this.guidAcuerdo) {
      this.AgreementsService.getAcuerdoByGuid(this.guidAcuerdo).subscribe({
        next: data => {
          this.acuerdoData = new AcuerdoModel(data);
          console.log('  acuerdo found it  ', this.acuerdoData);
        },
        error: () => {
          this.snackBar.open('Error al cargar el estudios previos', '', {
            duration: 3000,
          });
        },
      });
    }
  }

  guardarAcuerdo() {
    const request$ = this.guidAcuerdo
      ? this.AgreementsService.updateAgreement(this.acuerdoData)
      : this.AgreementsService.saveAgreement(this.acuerdoData);

    request$.subscribe({
      next: response => {
        this.isLoading = false;
        if (response.solicitud_exitosa) {
          this.snackBar.open(response.mensaje ?? 'Operación exitosa', '', { duration: 3000 });
          this.router.navigate(['/acuerdos/estudios-previos']);
        } else {
          this.snackBar.open(response.mensaje ?? 'Error al guardar', '', { duration: 4000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al guardar elacuerdo', '', { duration: 4000 });
      },
    });
  }
}
