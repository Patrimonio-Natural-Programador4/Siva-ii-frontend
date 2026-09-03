import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared';
import { MtxDrawer } from '@ng-matero/extensions/drawer';
import { ViajesService } from 'src/app/services/viajes.service';
import { TravelLegalization } from 'src/app/models/travel-legalization';
import { LegalizacionForm } from '../legalizacion-form';

@Component({
  selector: 'app-ver-detalle-legalizacion',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeader,
  ],
  templateUrl: './ver-detalle.html',
  styleUrl: './ver-detalle.scss',
})
export class VerDetalleLegalizacion implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ViajesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly drawer = inject(MtxDrawer);

  guidViaje = '';
  idLeg = 0;
  viajeData: any = null;
  legalizacionData: TravelLegalization | null = null;
  isLoading = false;

  regimenTypes = [
    { id: 1, name: 'Responsable de IVA' },
    { id: 2, name: 'NO Responsable de IVA' },
    { id: 3, name: 'Regimen Simple de Tributación' },
    { id: 4, name: 'Regimen de tributación especial' },
  ];

  ngOnInit(): void {
    this.guidViaje = this.route.snapshot.params['idviaje'] || '';
    this.idLeg = Number(this.route.snapshot.params['idleg']) || 0;
    if (this.guidViaje && this.idLeg) {
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.service.getViajeById(this.guidViaje).subscribe({
      next: viaje => {
        this.viajeData = viaje;
        if (viaje && viaje.id_viaje) {
          this.service.getLegalizacionByTravelId(viaje.id_viaje).subscribe({
            next: (legs: TravelLegalization[]) => {
              if (Array.isArray(legs)) {
                this.legalizacionData = legs.find(l => l.legalization_id === this.idLeg) || null;
              } else {
                this.legalizacionData = null;
              }
              this.isLoading = false;
            },
            error: () => {
              this.legalizacionData = null;
              this.isLoading = false;
            },
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.snackBar.open('Error al cargar la información del viaje', '', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  obtenerNombreRegimen(id: number | null | undefined): string {
    if (!id) return '--';
    const r = this.regimenTypes.find(reg => reg.id === id);
    return r ? r.name : '--';
  }

  editarLegalizacion(): void {
    if (!this.viajeData?.id_viaje || !this.legalizacionData) return;
    const drawerRef = this.drawer.open(LegalizacionForm, {
      position: 'right',
      width: '45%',
    });
    drawerRef.instance.travelRequestId = this.viajeData.id_viaje;
    drawerRef.instance.legalizacionId = this.legalizacionData.legalization_id;
    drawerRef.instance.legalizacionData = this.legalizacionData;
    drawerRef.afterDismissed().subscribe(res => {
      if (res && this.viajeData?.id_viaje) {
        this.cargarDatos();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/viajes/legalizacion/detalle', this.guidViaje]);
  }
}
