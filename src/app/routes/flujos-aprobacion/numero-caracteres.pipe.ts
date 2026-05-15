import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeroCaracteres',
})
export class NumeroCaracteresPipe implements PipeTransform {
  transform(value: string | undefined | null, maxLength: number): string {
    if (!value) {
      return '';
    }

    return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
  }
}