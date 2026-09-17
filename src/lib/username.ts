const FAKE_DOMAIN = 'universopark.app';

function slugify(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Converte um nome de sócio em um e-mail sintético usado só internamente pelo Supabase Auth. */
export function nomeToEmail(nome: string): string {
  return `${slugify(nome)}@${FAKE_DOMAIN}`;
}

/** Reconstrói um nome de exibição a partir do e-mail sintético (perde acentuação original). */
export function emailToNome(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local
    .split('-')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
