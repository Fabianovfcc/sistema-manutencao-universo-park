import { useState } from 'react';
import { whatsappLink } from '../../lib/whatsapp';

interface Props {
  numero: string;
  onNumeroChange: (v: string) => void;
  mensagem: string;
}

export default function WhatsAppSection({ numero, onNumeroChange, mensagem }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(mensagem);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <div className="modal-section">
      <h3>Avisar sócios no WhatsApp</h3>
      <div className="field">
        <label>Número (com DDD)</label>
        <input
          placeholder="(62) 99999-9999"
          value={numero}
          onChange={(e) => onNumeroChange(e.target.value)}
        />
      </div>
      <textarea readOnly rows={6} value={mensagem} style={{ color: 'var(--text-2)' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={copiar}>
          {copiado ? '✓ Copiado' : 'Copiar mensagem'}
        </button>
        <a
          className="btn btn-primary btn-sm"
          href={whatsappLink(numero, mensagem)}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none' }}
        >
          Abrir no WhatsApp
        </a>
      </div>
    </div>
  );
}
