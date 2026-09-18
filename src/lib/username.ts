const FAKE_DOMAIN = 'universopark.app';
const DISPLAY_NAMES_KEY = 'manutencao_nomes_exibicao';

function slugify(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '');
}

/** Converte um nome de sócio em um e-mail sintético usado só internamente pelo Supabase Auth. */
export function nomeToEmail(nome: string): string {
  return `${slugify(nome)}@${FAKE_DOMAIN}`;
}

function readDisplayNames(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(DISPLAY_NAMES_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/** Lembra, neste navegador, qual nome (com espaços/acentos) corresponde a este e-mail sintético. */
export function rememberDisplayName(email: string, nome: string): void {
  const map = readDisplayNames();
  map[email] = nome.trim();
  localStorage.setItem(DISPLAY_NAMES_KEY, JSON.stringify(map));
}

/** Nome de exibição para um e-mail sintético: usa o nome lembrado neste navegador, ou deriva do e-mail. */
export function emailToNome(email: string): string {
  const remembered = readDisplayNames()[email];
  if (remembered) return remembered;
  const local = email.split('@')[0] ?? '';
  return local ? local[0].toUpperCase() + local.slice(1) : '';
}
