import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OS } from '../types';
import { STATUS_LABEL } from '../types';
import { formatDateBR, formatMoney, formatOSNumero } from './format';

export function gerarRelatorioPDF(rows: OS[], inicio: string, fim: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const margin = 40;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Central de Manutenção — Universo Park', margin, 40);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90);
  doc.text(`Relatório de Ordens de Serviço — ${formatDateBR(inicio)} a ${formatDateBR(fim)}`, margin, 58);

  const totalGasto = rows.reduce((sum, o) => sum + (o.preco || 0), 0);
  const resolvidas = rows.filter((o) => o.status === 'resolvido').length;

  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(
    `Total de O.S. no período: ${rows.length}    ·    Resolvidas: ${resolvidas}    ·    Total gasto: ${formatMoney(totalGasto)}`,
    margin,
    76
  );

  autoTable(doc, {
    startY: 92,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 5, valign: 'middle' },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 55 },
      7: { halign: 'right' },
    },
    head: [
      ['Nº', 'Título', 'Categoria', 'Prioridade', 'Sócio', 'Status', 'Empresa executante', 'Preço', 'Abertura', 'Prevista', 'Resolução'],
    ],
    body: rows.map((o) => [
      formatOSNumero(o.numero),
      o.titulo,
      o.categoria,
      o.prioridade,
      o.socio_responsavel ?? '—',
      STATUS_LABEL[o.status],
      o.empresa_executante ?? '—',
      formatMoney(o.preco),
      formatDateBR(o.data_abertura),
      o.data_prevista ? formatDateBR(o.data_prevista) : '—',
      o.data_resolucao ? formatDateBR(o.data_resolucao) : '—',
    ]),
  });

  const geradoEm = new Date().toLocaleString('pt-BR');
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(`Gerado em ${geradoEm}  ·  página ${i} de ${totalPages}`, margin, doc.internal.pageSize.getHeight() - 20);
  }

  doc.save(`relatorio-os_${inicio}_a_${fim}.pdf`);
}
