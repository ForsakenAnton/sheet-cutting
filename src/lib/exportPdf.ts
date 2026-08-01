import { jsPDF } from 'jspdf';
import type { LayoutResult, Project } from '../types';
import { partColor } from './palette';
import { formatArea, formatLength, formatPercent, partSizeLabel } from './format';

const PT_TO_MM = 0.352778;

export function exportPdf(project: Project, result: LayoutResult, filename: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const { sheet, unit } = project;
  const sheetArea = sheet.width * sheet.height;

  result.sheets.forEach((layout, index) => {
    if (index > 0) doc.addPage();

    doc.setFontSize(14);
    doc.setTextColor('#111111');
    doc.text('Sheet Cutting Plan', margin, margin);

    doc.setFontSize(9);
    doc.setTextColor('#555555');
    const meta = [
      `Sheet ${index + 1} of ${result.sheets.length}`,
      `${formatLength(sheet.width, unit)} × ${formatLength(sheet.height, unit)} ${unit}`,
      sheet.material,
      `${layout.parts.length} parts`,
      `utilization ${formatPercent(layout.usedArea / sheetArea)}`,
    ];
    doc.text(meta.join('   ·   '), margin, margin + 6);

    const top = margin + 14;
    const availW = pageW - margin * 2;
    const availH = pageH - top - margin;
    const scale = Math.min(availW / sheet.width, availH / sheet.height);
    const width = sheet.width * scale;
    const height = sheet.height * scale;
    const x0 = margin + (availW - width) / 2;
    const y0 = top;

    doc.setFillColor('#f1f3f5');
    doc.setDrawColor('#495057');
    doc.setLineWidth(0.4);
    doc.rect(x0, y0, width, height, 'FD');

    doc.setLineWidth(0.2);
    layout.parts.forEach((part) => {
      const color = partColor(part.colorIndex);
      const px = x0 + part.x * scale;
      const py = y0 + part.y * scale;
      const pw = part.width * scale;
      const ph = part.height * scale;

      doc.setFillColor(color.fill);
      doc.setDrawColor(color.stroke);
      doc.rect(px, py, pw, ph, 'FD');

      const label = partSizeLabel(part.width, part.height, unit);
      doc.setFontSize(10);
      const labelWidth = doc.getTextWidth(label);
      const size = Math.min(10, (10 * pw * 0.85) / labelWidth, (ph * 0.5) / PT_TO_MM);

      if (size >= 4) {
        doc.setFontSize(size);
        doc.setTextColor('#1b1f23');
        doc.text(label, px + pw / 2, py + ph / 2, { align: 'center', baseline: 'middle' });
      }
    });

    doc.setFontSize(8);
    doc.setTextColor('#555555');
    doc.text(`${formatLength(sheet.width, unit)} ${unit}`, x0 + width / 2, y0 - 2.5, {
      align: 'center',
    });
    doc.text(`${formatLength(sheet.height, unit)} ${unit}`, x0 - 3, y0 + height / 2, {
      align: 'center',
      baseline: 'middle',
      angle: 90,
    });
  });

  doc.addPage();
  let y = margin;

  doc.setFontSize(14);
  doc.setTextColor('#111111');
  doc.text('Summary', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor('#333333');
  const summary = [
    [
      'Sheet size',
      `${formatLength(sheet.width, unit)} × ${formatLength(sheet.height, unit)} ${unit}`,
    ],
    [
      'Material',
      sheet.thickness > 0
        ? `${sheet.material}, ${formatLength(sheet.thickness, unit)} ${unit}`
        : sheet.material,
    ],
    ['Sheets used', String(result.sheets.length)],
    ['Parts placed', `${result.placedCount} / ${result.totalCount}`],
    ['Used area', formatArea(result.usedArea, unit)],
    ['Waste area', formatArea(result.wasteArea, unit)],
    ['Utilization', formatPercent(result.utilization)],
    ['Blade kerf', `${formatLength(project.settings.kerf, unit)} ${unit}`],
    ['Edge margin', `${formatLength(project.settings.margin, unit)} ${unit}`],
  ];

  summary.forEach(([label, value]) => {
    doc.setTextColor('#666666');
    doc.text(label, margin, y);
    doc.setTextColor('#111111');
    doc.text(value, margin + 45, y);
    y += 6;
  });

  y += 6;
  doc.setFontSize(14);
  doc.setTextColor('#111111');
  doc.text('Cut List', margin, y);
  y += 8;

  const columns = [margin, margin + 14, margin + 44, margin + 74, margin + 94, margin + 124];
  const headers = ['#', 'Width', 'Height', 'Qty', 'Rotated', 'Area'];

  doc.setFontSize(9);
  doc.setTextColor('#666666');
  headers.forEach((header, index) => doc.text(header, columns[index], y));
  y += 2;
  doc.setDrawColor('#cccccc');
  doc.setLineWidth(0.2);
  doc.line(margin, y, margin + 160, y);
  y += 5;

  doc.setTextColor('#111111');
  project.parts.forEach((part, index) => {
    if (y > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    const rotated = result.rotatedByPart[part.id] ?? 0;
    const row = [
      String(index + 1),
      `${formatLength(part.width, unit)} ${unit}`,
      `${formatLength(part.height, unit)} ${unit}`,
      String(part.qty),
      rotated > 0 ? `${rotated} × 90°` : '0°',
      formatArea(part.width * part.height * part.qty, unit),
    ];
    row.forEach((cell, cellIndex) => doc.text(cell, columns[cellIndex], y));
    y += 6;
  });

  doc.save(filename);
}
