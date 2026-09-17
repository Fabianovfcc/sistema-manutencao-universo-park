export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatOSNumero(n: number): string {
  return `OS-${String(n).padStart(4, '0')}`;
}

export function formatMoney(v: number | null | undefined): string {
  return (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function daysAgo(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

export function isAtrasado(dataPrevista: string | null, status: string): boolean {
  if (!dataPrevista || status === 'resolvido' || status === 'solicitacao') return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(dataPrevista + 'T00:00:00') < hoje;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
