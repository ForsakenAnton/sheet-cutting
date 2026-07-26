function download(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportSvg(container: HTMLElement | null, filename: string): void {
  if (!container) return;

  const nodes = Array.from(container.querySelectorAll<SVGSVGElement>('svg[data-sheet]'));
  if (nodes.length === 0) return;

  const sheets = nodes.map((node) => {
    const box = (node.getAttribute('viewBox') ?? '0 0 100 100').split(/\s+/).map(Number);
    return { width: box[2], height: box[3], content: node.innerHTML };
  });

  const width = Math.max(...sheets.map((item) => item.width));
  const gap = width * 0.03;
  let offset = 0;

  const body = sheets
    .map((item) => {
      const group = `<g transform="translate(0 ${offset})">${item.content}</g>`;
      offset += item.height + gap;
      return group;
    })
    .join('\n');

  const height = Math.max(offset - gap, 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${body}\n</svg>`;

  download(svg, filename, 'image/svg+xml;charset=utf-8');
}
