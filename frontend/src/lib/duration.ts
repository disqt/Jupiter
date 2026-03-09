export function parseDuration(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  const hm = s.match(/^(\d+)\s*h\s*(\d+)?\s*(min)?$/i);
  if (hm) {
    const h = parseInt(hm[1]);
    const m = hm[2] ? parseInt(hm[2]) : 0;
    return h * 60 + m;
  }
  const colon = s.match(/^(\d+):(\d{1,2})$/);
  if (colon) return parseInt(colon[1]) * 60 + parseInt(colon[2]);
  const mOnly = s.match(/^(\d+)\s*(min|m)$/i);
  if (mOnly) return parseInt(mOnly[1]);
  if (/^\d+$/.test(s)) return parseInt(s);
  return null;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}
