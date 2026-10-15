import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeader } from '@shared';
import { AgreementsService } from 'src/app/services/agreements/agreements';
import { AcuerdoModel } from 'src/app/models/acuerdos';

@Component({
  selector: 'app-detalle-acuerdo',
  imports: [
    PageHeader,
    CommonModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './detalle-acuerdo.html',
  styleUrl: './detalle-acuerdo.scss',
})
export class DetalleAcuerdo implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly AgreementsService = inject(AgreementsService);
  private readonly snackBar = inject(MatSnackBar);

  guidAgreement = '';
  agrrementId: string | undefined | null;
  private route = inject(ActivatedRoute);
  isLoading = false;
  acuerdo: AcuerdoModel = {};

  ngOnInit(): void {
    const guid = this.route.snapshot.paramMap.get('guid');
    if (guid) {
      this.guidAgreement = guid;
      //console.log(`agreement guid ${guid}`);

      this.getAcuerdo(this.guidAgreement);
    } else {
      console.warn('No se encontró el parámetro guid');
      /*this.snackBar.open('No se recibió el identificador de la estudio previo', '', {
        duration: 3000,
      });
      this.volver();*/
    }
  }

  private getAcuerdo(guid: string): void {
    this.isLoading = true;

    this.AgreementsService.getAcuerdoByGuid(guid).subscribe({
      next: data => {
        console.log('1. DATA RECIBIDA del acuerdo:', data);
        this.acuerdo = data;
      },
      error: err => {
        console.log('ERrror acuerdo ', err);

        //console.error('ERROR COMPLETO:', err);
        //console.dir(err);

        this.snackBar.open('Error al cargar el acuerdo', '', { duration: 3000 });
        this.isLoading = false;
        this.volver();
      },
    });
  }

  volver(): void {
    this.router.navigate(['./estudios-previos/estudios-previos-tabla/estudios-previos-tabla']);
  }
}
