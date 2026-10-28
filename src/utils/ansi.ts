/**
 * Robust ANSI escape code to HTML converter
 */
export function ansiToHtml(text: string): string {
  if (!text) return '';

  // Escape HTML characters first
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Standard 16 ANSI colors map
  const colorMap: Record<number, string> = {
    30: '#1e293b', // Black
    31: '#f87171', // Red
    32: '#4ade80', // Green
    33: '#facc15', // Yellow
    34: '#60a5fa', // Blue
    35: '#c084fc', // Magenta
    36: '#38bdf8', // Cyan
    37: '#f1f5f9', // White
    90: '#64748b', // Bright Black (Gray)
    91: '#ef4444', // Bright Red
    92: '#22c55e', // Bright Green
    93: '#eab308', // Bright Yellow
    94: '#3b82f6', // Bright Blue
    95: '#a855f7', // Bright Magenta
    96: '#06b6d4', // Bright Cyan
    97: '#ffffff', // Bright White
  };

  const bgMap: Record<number, string> = {
    40: '#0f172a',
    41: '#991b1b',
    42: '#166534',
    43: '#854d0e',
    44: '#1e40af',
    45: '#6b21a8',
    46: '#155e75',
    47: '#e2e8f0',
  };

  // Convert ANSI control sequences
  const ansiRegex = /\x1b\[([0-9;]*)m/g;
  let activeStyles: { color?: string; bg?: string; bold?: boolean; underline?: boolean } = {};
  let lastIndex = 0;
  let result = '';

  let match: RegExpExecArray | null;
  while ((match = ansiRegex.exec(escaped)) !== null) {
    const rawChunk = escaped.slice(lastIndex, match.index);
    if (rawChunk) {
      result += wrapChunk(rawChunk, activeStyles);
    }

    const codes = match[1] ? match[1].split(';').map(Number) : [0];
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      if (code === 0) {
        activeStyles = {};
      } else if (code === 1) {
        activeStyles.bold = true;
      } else if (code === 4) {
        activeStyles.underline = true;
      } else if (colorMap[code]) {
        activeStyles.color = colorMap[code];
      } else if (bgMap[code]) {
        activeStyles.bg = bgMap[code];
      } else if (code === 38 && codes[i + 1] === 5 && codes[i + 2] !== undefined) {
        // 256 color foreground
        activeStyles.color = get256Color(codes[i + 2]);
        i += 2;
      } else if (code === 48 && codes[i + 1] === 5 && codes[i + 2] !== undefined) {
        // 256 color background
        activeStyles.bg = get256Color(codes[i + 2]);
        i += 2;
      }
    }

    lastIndex = ansiRegex.lastIndex;
  }

  // Add remaining text
  const remaining = escaped.slice(lastIndex);
  if (remaining) {
    result += wrapChunk(remaining, activeStyles);
  }

  // Handle common escape sequences like \r and backspaces
  return result;
}

function get256Color(code: number): string {
  if (code < 16) {
    const standard = [
      '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
      '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
    ];
    return standard[code] || '#ffffff';
  }
  if (code >= 232 && code <= 255) {
    const gray = Math.round(((code - 232) / 23) * 255);
    return `rgb(${gray},${gray},${gray})`;
  }
  // 6x6x6 color cube
  code -= 16;
  const b = (code % 6) * 51;
  const g = (Math.floor(code / 6) % 6) * 51;
  const r = (Math.floor(code / 36) % 6) * 51;
  return `rgb(${r},${g},${b})`;
}

function wrapChunk(text: string, styles: { color?: string; bg?: string; bold?: boolean; underline?: boolean }): string {
  if (!text) return '';
  const inlineStyles: string[] = [];
  if (styles.color) inlineStyles.push(`color: ${styles.color}`);
  if (styles.bg) inlineStyles.push(`background-color: ${styles.bg}`);
  if (styles.bold) inlineStyles.push(`font-weight: 600`);
  if (styles.underline) inlineStyles.push(`text-decoration: underline`);

  if (inlineStyles.length === 0) return text;
  return `<span style="${inlineStyles.join('; ')}">${text}</span>`;
}
