import type { OS } from '../types';
import { STATUS_LABEL } from '../types';
import { formatDateBR, formatMoney, formatOSNumero } from './format';

function csvField(v: string): string {
  if (/[";\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function osListToCSV(rows: OS[]): string {
  const header = [
    'Número',
    'Título',
    'Categoria',
    'Prioridade',
    'Sócio responsável',
    'Status',
    'Empresa executante',
    'Preço',
    'Data de abertura',
    'Data prevista',
    'Data de resolução',
  ];
  const lines = [header.map(csvField).join(';')];
  for (const o of rows) {
    lines.push(
      [
        formatOSNumero(o.numero),
        o.titulo,
        o.categoria,
        o.prioridade,
        o.socio_responsavel ?? '',
        STATUS_LABEL[o.status],
        o.empresa_executante ?? '',
        formatMoney(o.preco),
        formatDateBR(o.data_abertura),
        o.data_prevista ? formatDateBR(o.data_prevista) : '',
        o.data_resolucao ? formatDateBR(o.data_resolucao) : '',
      ]
        .map(csvField)
        .join(';')
    );
  }
  return '﻿' + lines.join('\r\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
