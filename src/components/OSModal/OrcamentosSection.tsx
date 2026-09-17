import type { UIOrcamento } from './types';

interface Props {
  orcamentos: UIOrcamento[];
  onAdd: () => void;
  onChange: (id: string, patch: Partial<UIOrcamento>) => void;
  onRemove: (id: string) => void;
  onUsar: (id: string) => void;
}

export default function OrcamentosSection({ orcamentos, onAdd, onChange, onRemove, onUsar }: Props) {
  return (
    <div className="modal-section">
      <h3>Orçamentos (comparar fornecedores)</h3>
      {orcamentos.map((o) => (
        <div
          key={o.id}
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: 8,
            borderRadius: 8,
            background: o.aprovado ? 'color-mix(in srgb, var(--green) 12%, transparent)' : undefined,
          }}
        >
          <input
            placeholder="Empresa"
            value={o.empresa}
            onChange={(e) => onChange(o.id, { empresa: e.target.value })}
            style={{ flex: 2, minWidth: 120 }}
          />
          <input
            placeholder="Contato"
            value={o.contato}
            onChange={(e) => onChange(o.id, { contato: e.target.value })}
            style={{ flex: 2, minWidth: 120 }}
          />
          <input
            type="number"
            placeholder="Valor"
            value={o.valor || ''}
            onChange={(e) => onChange(o.id, { valor: Number(e.target.value) })}
            style={{ flex: 1, minWidth: 90 }}
          />
          <button
            type="button"
            className={o.aprovado ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
            onClick={() => onUsar(o.id)}
          >
            {o.aprovado ? '✓ Em uso' : 'Usar este orçamento'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRemove(o.id)}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-sm" onClick={onAdd}>
        + Adicionar orçamento
      </button>
    </div>
  );
}
