import { useState } from 'react';
import type { UILogEntry } from './types';

interface Props {
  entradas: UILogEntry[];
  onAdicionar: (texto: string) => void;
}

export default function HistoricoSection({ entradas, onAdicionar }: Props) {
  const [texto, setTexto] = useState('');

  function enviar() {
    if (!texto.trim()) return;
    onAdicionar(texto.trim());
    setTexto('');
  }

  return (
    <div className="modal-section">
      <h3>Histórico desta O.S.</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Adicionar comentário..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              enviar();
            }
          }}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-secondary btn-sm" onClick={enviar}>
          Adicionar
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
        {entradas.length === 0 && (
          <span style={{ color: 'var(--text-2)', fontSize: 12 }}>Sem histórico ainda.</span>
        )}
        {entradas.map((e) => (
          <div key={e.id} style={{ fontSize: 12, borderLeft: '2px solid var(--border)', paddingLeft: 8 }}>
            <div>{e.texto}</div>
            <div className="mono" style={{ color: 'var(--text-2)', fontSize: 11 }}>
              {e.autor || 'sistema'} · {new Date(e.createdAt).toLocaleString('pt-BR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
