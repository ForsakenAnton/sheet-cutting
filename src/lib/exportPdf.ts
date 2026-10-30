import { GState, jsPDF } from 'jspdf';
import type { LayoutResult, Project } from '../types';
import type { PartTexture } from './palette';
import { LABEL_COLOR, TEXTURE_OPACITY, partStyle } from './palette';
import {
  UNPLACED_REASONS,
  formatArea,
  formatLength,
  formatPercent,
  partSizeLabel,
  pieceCount,
} from './format';

const PT_TO_MM = 0.352778;
const ROW_HEIGHT = 6;
const SWATCH_SIZE = 3;

interface Row {
  partIndex: number;
  cells: string[];
}

function drawTexture(
  doc: jsPDF,
  texture: PartTexture,
  x: number,
  y: number,
  w: number,
  h: number,
  spacing: number,
): void {
  if (texture === 'none') return;
  const step = spacing * Math.SQRT2;

  doc.saveGraphicsState();
  doc.setGState(new GState({ 'stroke-opacity': TEXTURE_OPACITY }));
  doc.setDrawColor(LABEL_COLOR);
  doc.setLineWidth(spacing / 8);

  if (texture !== 'backward') {
    for (let c = x + y + step / 2; c < x + w + y + h; c += step) {
      const from = Math.max(x, c - y - h);
      const to = Math.min(x + w, c - y);
      if (to > from) doc.line(from, c - from, to, c - to);
    }
  }

  if (texture !== 'forward') {
    for (let d = y - x - w + step / 2; d < y + h - x; d += step) {
      const from = Math.max(x, y - d);
      const to = Math.min(x + w, y + h - d);
      if (to > from) doc.line(from, from + d, to, to + d);
    }
  }

  doc.restoreGraphicsState();
}

function drawPart(
  doc: jsPDF,
  partIndex: number,
  x: number,
  y: number,
  w: number,
  h: number,
  spacing: number,
): void {
  const style = partStyle(partIndex);
  doc.setLineWidth(0.2);
  doc.setFillColor(style.fill);
  doc.setDrawColor(style.stroke);
  doc.rect(x, y, w, h, 'FD');
  drawTexture(doc, style.texture, x, y, w, h, spacing);
}

export function exportPdf(project: Project, result: LayoutResult, filename: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const { sheet, unit, parts } = project;
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

    layout.parts.forEach((part) => {
      const px = x0 + part.x * scale;
      const py = y0 + part.y * scale;
      const pw = part.width * scale;
      const ph = part.height * scale;

      drawPart(doc, part.colorIndex, px, py, pw, ph, 1.6);

      const label = partSizeLabel(part.width, part.height, unit);
      doc.setFontSize(10);
      const labelWidth = doc.getTextWidth(label);
      const size = Math.min(10, (10 * pw * 0.85) / labelWidth, (ph * 0.5) / PT_TO_MM);

      if (size >= 4) {
        doc.setFontSize(size);
        doc.setTextColor(LABEL_COLOR);
        doc.text(label, px + pw / 2, py + ph / 2, { align: 'center', baseline: 'middle' });
      }
    });

    doc.setFontSize(8);
    doc.setTextColor('#555555');
    doc.text(`${formatLength(sheet.width, unit)} ${unit}`, x0 + width / 2, y0 - 2.5, {
      align: 'center',
    });
    const heightLabel = `${formatLength(sheet.height, unit)} ${unit}`;
    doc.text(heightLabel, x0 - 2.5, y0 + height / 2 + doc.getTextWidth(heightLabel) / 2, {
      angle: 90,
    });
  });

  doc.addPage();
  let y = margin;

  const heading = (title: string) => {
    if (y + 8 + ROW_HEIGHT * 3 > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(14);
    doc.setTextColor('#111111');
    doc.text(title, margin, y);
    y += 8;
  };

  const table = (columns: number[], headers: string[], rows: Row[]) => {
    const header = () => {
      doc.setFontSize(9);
      doc.setTextColor('#666666');
      headers.forEach((text, column) => doc.text(text, margin + columns[column], y));
      y += 2;
      doc.setDrawColor('#cccccc');
      doc.setLineWidth(0.2);
      doc.line(margin, y, margin + 160, y);
      y += 5;
    };

    header();
    rows.forEach((row) => {
      if (y > pageH - margin) {
        doc.addPage();
        y = margin;
        header();
      }
      drawPart(doc, row.partIndex, margin, y - 2.6, SWATCH_SIZE, SWATCH_SIZE, 0.8);
      doc.setFontSize(9);
      doc.setTextColor('#111111');
      row.cells.forEach((text, column) => doc.text(text, margin + columns[column], y));
      y += ROW_HEIGHT;
    });
  };

  heading('Summary');
  doc.setFontSize(10);
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
    y += ROW_HEIGHT;
  });

  const unplacedRows = result.unplaced.flatMap((item): Row[] => {
    const partIndex = parts.findIndex((part) => part.id === item.partId);
    if (partIndex < 0) return [];
    const part = parts[partIndex];
    return [
      {
        partIndex,
        cells: [
          String(partIndex + 1),
          `${partSizeLabel(part.width, part.height, unit)} ${unit}`,
          pieceCount(item.count),
          UNPLACED_REASONS[item.reason],
        ],
      },
    ];
  });

  if (unplacedRows.length > 0) {
    y += ROW_HEIGHT;
    heading('Not placed');
    table([5, 16, 56, 76], ['#', 'Size', 'Qty', 'Reason'], unplacedRows);
  }

  y += ROW_HEIGHT;
  heading('Cut List');
  table(
    [5, 16, 46, 76, 96, 126],
    ['#', 'Width', 'Height', 'Qty', 'Rotated', 'Area'],
    parts.map((part, partIndex) => {
      const rotated = result.rotatedByPart[part.id] ?? 0;
      return {
        partIndex,
        cells: [
          String(partIndex + 1),
          `${formatLength(part.width, unit)} ${unit}`,
          `${formatLength(part.height, unit)} ${unit}`,
          String(part.qty),
          rotated > 0 ? `${rotated} × 90°` : '0°',
          formatArea(part.width * part.height * part.qty, unit),
        ],
      };
    }),
  );

  doc.save(filename);
}
