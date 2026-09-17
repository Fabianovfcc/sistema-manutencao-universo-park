export function onlyDigits(v: string): string {
  return v.replace(/\D/g, '');
}

export function whatsappLink(numero: string, mensagem: string): string {
  const digits = onlyDigits(numero);
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(mensagem)}`;
}
