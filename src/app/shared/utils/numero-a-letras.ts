/**
 * Convierte un número a su representación en letras en español (Estándar Colombia / América Latina).
 * Soporta números de 0 hasta 999,999,999,999 (billones).
 */
export function numeroALetrasEspanol(valor: number): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '';
  }

  const n = Math.floor(Math.abs(valor));
  if (n === 0) {
    return 'Cero (COP/$)';
  }

  const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const DECENAS_10 = [
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciséis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ];
  const DECENAS = [
    '',
    'diez',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ];
  const CENTENAS = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ];

  const ESPECIALES_VEINTI: { [key: number]: string } = {
    21: 'veintiún',
    22: 'veintidós',
    23: 'veintitrés',
    24: 'veinticuatro',
    25: 'veinticinco',
    26: 'veintiséis',
    27: 'veintisiete',
    28: 'veintiocho',
    29: 'veintinueve',
  };

  function leerCentenas(num: number): string {
    if (num === 0) return '';
    if (num === 100) return 'cien';

    let resultado = '';
    const c = Math.floor(num / 100);
    const resto = num % 100;
    const d = Math.floor(resto / 10);
    const u = resto % 10;

    if (c > 0) {
      resultado += CENTENAS[c] + ' ';
    }

    if (resto >= 10 && resto <= 19) {
      resultado += DECENAS_10[resto - 10];
    } else if (resto >= 21 && resto <= 29) {
      resultado += ESPECIALES_VEINTI[resto];
    } else if (resto === 20) {
      resultado += 'veinte';
    } else if (d > 0) {
      resultado += DECENAS[d];
      if (u > 0) {
        resultado += ' y ' + UNIDADES[u];
      }
    } else if (u > 0) {
      resultado += UNIDADES[u];
    }

    return resultado.trim();
  }

  function leerMiles(num: number): string {
    if (num === 0) return '';
    if (num < 1000) return leerCentenas(num);

    const miles = Math.floor(num / 1000);
    const resto = num % 1000;

    let prefijo = '';
    if (miles === 1) {
      prefijo = 'mil';
    } else {
      prefijo = leerCentenas(miles) + ' mil';
    }

    const sufijo = leerCentenas(resto);
    return sufijo ? `${prefijo} ${sufijo}` : prefijo;
  }

  function leerMillones(num: number): string {
    if (num === 0) return '';
    if (num < 1000000) return leerMiles(num);

    const millones = Math.floor(num / 1000000);
    const resto = num % 1000000;

    let prefijo = '';
    if (millones === 1) {
      prefijo = 'un millón';
    } else {
      prefijo = leerMiles(millones) + ' millones';
    }

    const sufijo = leerMiles(resto);
    return sufijo ? `${prefijo} ${sufijo}` : prefijo;
  }

  function leerBillones(num: number): string {
    if (num < 1000000000000) return leerMillones(num);

    const billones = Math.floor(num / 1000000000000);
    const resto = num % 1000000000000;

    let prefijo = '';
    if (billones === 1) {
      prefijo = 'un billón';
    } else {
      prefijo = leerMillones(billones) + ' billones';
    }

    const sufijo = leerMillones(resto);
    return sufijo ? `${prefijo} ${sufijo}` : prefijo;
  }

  const texto = leerBillones(n).trim();
  if (!texto) return '';

  const capitalizado = texto.charAt(0).toUpperCase() + texto.slice(1);
  return `${capitalizado} (COP/$)`;
}
