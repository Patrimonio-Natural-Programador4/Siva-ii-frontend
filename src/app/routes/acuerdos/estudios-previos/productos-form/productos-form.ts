import { Component, inject } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MTX_DRAWER_DATA, MtxDrawerRef } from '@ng-matero/extensions/drawer';
import { ProductoEstudio, ProductosFormData } from 'src/app/models/agreements-products';

@Component({
  selector: 'app-productos-form',
  imports: [FormsModule, MatButtonModule, LowerCasePipe],
  templateUrl: './productos-form.html',
})
export class ProductosForm {
  readonly data = inject<ProductosFormData>(MTX_DRAWER_DATA);
  private readonly drawerRef = inject<MtxDrawerRef<ProductosForm, ProductoEstudio>>(MtxDrawerRef);
  readonly nombreTipo = {
    objetivo: 'Objetivo',
    actividad: 'Actividad',
    producto: 'Producto',
  }[this.data.tipo];

  registro: ProductoEstudio = this.data.registro
    ? { ...this.data.registro }
    : {
        code: '',
        product: '',
        unit_measure: '',
        quantity: null,
        observations: '',
      };
  error = '';

  guardar(form: NgForm): void {
    this.error = '';
    form.control.markAllAsTouched();
    const product = this.registro.product?.trim();
    const code = this.registro.code?.trim();
    const unitMeasure = this.registro.unit_measure?.trim();
    if (
      form.invalid ||
      !product ||
      (this.data.tipo !== 'objetivo' && !code) ||
      (this.data.tipo === 'producto' && !unitMeasure)
    ) {
      this.error = 'Complete los campos requeridos con valores válidos.';
      return;
    }
    if (this.data.tipo === 'producto' && this.data.codigosExistentes?.includes(code ?? '')) {
      this.error = 'El código del producto ya existe en esta actividad.';
      return;
    }
    this.drawerRef.dismiss({
      code: code ?? '',
      product,
      ...(this.data.tipo === 'producto'
        ? {
            unit_measure: unitMeasure,
            quantity: this.registro.quantity,
            observations: this.registro.observations?.trim(),
            state_id: this.data.registro?.state_id ?? 1,
          }
        : {}),
    });
  }

  cancelar(): void {
    this.drawerRef.dismiss();
  }
}
