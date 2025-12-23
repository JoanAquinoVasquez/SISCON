/**
 * Hook para convertir números a letras en español
 */

const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function convertirGrupo(numero: number): string {
  if (numero === 0) return '';
  if (numero === 100) return 'CIEN';
  
  const centena = Math.floor(numero / 100);
  const resto = numero % 100;
  const decena = Math.floor(resto / 10);
  const unidad = resto % 10;
  
  let resultado = centenas[centena];
  
  if (resto >= 10 && resto < 20) {
    resultado += (resultado ? ' ' : '') + especiales[resto - 10];
  } else {
    if (decena > 0) {
      resultado += (resultado ? ' ' : '') + decenas[decena];
      if (unidad > 0) {
        resultado += (decena === 2 ? '' : ' Y ') + unidades[unidad];
      }
    } else if (unidad > 0) {
      resultado += (resultado ? ' ' : '') + unidades[unidad];
    }
  }
  
  return resultado;
}

export function numeroALetras(numero: number): string {
  if (numero === 0) return 'CERO SOLES';
  if (numero < 0) return 'NÚMERO NEGATIVO';
  
  // Separar parte entera y decimal
  const parteEntera = Math.floor(numero);
  const parteDecimal = Math.round((numero - parteEntera) * 100);
  
  let resultado = '';
  
  // Millones
  const millones = Math.floor(parteEntera / 1000000);
  if (millones > 0) {
    if (millones === 1) {
      resultado += 'UN MILLÓN ';
    } else {
      resultado += convertirGrupo(millones) + ' MILLONES ';
    }
  }
  
  // Miles
  const miles = Math.floor((parteEntera % 1000000) / 1000);
  if (miles > 0) {
    if (miles === 1) {
      resultado += 'MIL ';
    } else {
      resultado += convertirGrupo(miles) + ' MIL ';
    }
  }
  
  // Unidades
  const unidadesNum = parteEntera % 1000;
  if (unidadesNum > 0) {
    resultado += convertirGrupo(unidadesNum);
  }
  
  // Agregar "SOLES" y parte decimal
  resultado = resultado.trim();
  if (parteDecimal > 0) {
    resultado += ` CON ${parteDecimal.toString().padStart(2, '0')}/100 SOLES`;
  } else {
    resultado += ' SOLES';
  }
  
  return resultado;
}

export function useNumeroALetras() {
  return { numeroALetras };
}
