import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MTX_DRAWER_DATA, MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { DesembolsoEstudio, DesembolsoFormData } from 'src/app/models/desembolsos-estudio';

@Component({
  selector: 'app-desembolsos-form',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './desembolsos-form.html',
})
export class DesembolsosForm {
  readonly data = inject<DesembolsoFormData>(MTX_DRAWER_DATA);
  private readonly drawerRef =
    inject<MtxDrawerRef<DesembolsosForm, DesembolsoEstudio>>(MtxDrawerRef);
  registro: DesembolsoEstudio = this.data.desembolso
    ? {
        ...this.data.desembolso,
        product_keys: [...this.data.desembolso.product_keys],
      }
    : {
        number_disbursement: null,
        scheduled_date: null,
        value: null,
        state_id: 1,
        product_keys: [],
      };
  error = '';

  seleccionar(key: string, seleccionado: boolean): void {
    this.registro.product_keys = seleccionado
      ? [...this.registro.product_keys, key]
      : this.registro.product_keys.filter(producto => producto !== key);
  }

  guardar(form: NgForm): void {
    form.control.markAllAsTouched();
    const disponibles = new Set(this.data.productos.filter(p => !p.usado).map(p => p.key));
    if (
      form.invalid ||
      !Number.isInteger(this.registro.number_disbursement) ||
      !this.registro.product_keys.length ||
      this.registro.product_keys.some(key => !disponibles.has(key)) ||
      !this.data.estados.some(estado => estado.id === this.registro.state_id)
    ) {
      this.error = 'Complete los campos requeridos y seleccione al menos un producto disponible.';
      return;
    }
    this.drawerRef.dismiss({ ...this.registro });
  }

  cancelar(): void {
    this.drawerRef.dismiss();
  }
}
