function srgbChannelToLinear(channel255: number): number {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbChannelToLinear(r) + 0.7152 * srgbChannelToLinear(g) + 0.0722 * srgbChannelToLinear(b);
}

function parseRgb(value: string): [number, number, number] | null {
  const match = value.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (!match) return null;
  return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
}

export function contrastRatio(colorA: string, colorB: string): number | null {
  const a = parseRgb(colorA);
  const b = parseRgb(colorB);
  if (!a || !b) return null;

  const lA = relativeLuminance(a);
  const lB = relativeLuminance(b);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);

  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastForVarPair(containerVar: string, onVar: string): number | null {
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.position = 'fixed';
  probe.style.top = '-9999px';
  probe.style.left = '-9999px';
  probe.style.backgroundColor = `var(${containerVar})`;
  probe.style.color = `var(${onVar})`;
  document.body.appendChild(probe);

  const computed = getComputedStyle(probe);
  const ratio = contrastRatio(computed.color, computed.backgroundColor);

  document.body.removeChild(probe);

  return ratio;
}

export function formatRatio(ratio: number | null): string {
  return ratio === null ? '—' : `${ratio.toFixed(2)}:1`;
}

export function meetsAA(ratio: number | null, large = false): boolean {
  if (ratio === null) return false;
  return ratio >= (large ? 3 : 4.5);
}
