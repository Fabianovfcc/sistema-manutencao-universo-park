import { CATEGORIAS, PRIORIDADES, type OS } from '../../types';

export interface Filtros {
  socio: string;
  categoria: string;
  prioridade: string;
}

interface Props {
  osList: OS[];
  filtros: Filtros;
  onChange: (f: Filtros) => void;
}

export default function FilterBar({ osList, filtros, onChange }: Props) {
  const socios = Array.from(
    new Set(osList.map((o) => o.socio_responsavel).filter((v): v is string => !!v))
  ).sort();

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        padding: '14px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--panel-2)',
      }}
    >
      <select
        value={filtros.socio}
        onChange={(e) => onChange({ ...filtros, socio: e.target.value })}
      >
        <option value="">Todos os sócios</option>
        {socios.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={filtros.categoria}
        onChange={(e) => onChange({ ...filtros, categoria: e.target.value })}
      >
        <option value="">Todas as categorias</option>
        {CATEGORIAS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={filtros.prioridade}
        onChange={(e) => onChange({ ...filtros, prioridade: e.target.value })}
      >
        <option value="">Todas as prioridades</option>
        {PRIORIDADES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {(filtros.socio || filtros.categoria || filtros.prioridade) && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange({ socio: '', categoria: '', prioridade: '' })}
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
