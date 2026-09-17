import { useEffect, useMemo, useState } from 'react';
import type { OS, Status } from '../../types';
import { COLUNAS } from '../../types';
import Column from './Column';
import OSCard from './OSCard';
import FilterBar, { type Filtros } from './FilterBar';
import { fetchAllAnexosMeta, updateOS, addLogEntry } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import './Kanban.css';

interface Props {
  osList: OS[];
  loading: boolean;
  onOpen: (os: OS) => void;
  onChanged: () => void;
}

export default function KanbanBoard({ osList, loading, onOpen, onChanged }: Props) {
  const { socioNome } = useAuth();
  const [filtros, setFiltros] = useState<Filtros>({ socio: '', categoria: '', prioridade: '' });
  const [anexosMeta, setAnexosMeta] = useState<{ os_id: string; tipo: string }[]>([]);

  useEffect(() => {
    fetchAllAnexosMeta()
      .then(setAnexosMeta)
      .catch(() => {});
  }, [osList.length]);

  const filtered = useMemo(() => {
    return osList.filter((o) => {
      if (filtros.socio && o.socio_responsavel !== filtros.socio) return false;
      if (filtros.categoria && o.categoria !== filtros.categoria) return false;
      if (filtros.prioridade && o.prioridade !== filtros.prioridade) return false;
      return true;
    });
  }, [osList, filtros]);

  async function handleStatusChange(os: OS, status: Status) {
    await updateOS(os.id, {
      status,
      data_resolucao: status === 'resolvido' ? new Date().toISOString().slice(0, 10) : null,
    });
    await addLogEntry(os.id, socioNome, `Status alterado para ${statusLabel(status)}`);
    onChanged();
  }

  function statusLabel(s: Status) {
    return COLUNAS.find((c) => c.status === s)?.label ?? s;
  }

  return (
    <div className="kanban-wrap">
      <FilterBar osList={osList} filtros={filtros} onChange={setFiltros} />
      {loading ? (
        <div style={{ padding: 24, color: 'var(--text-2)' }}>Carregando...</div>
      ) : (
        <div className="kanban-columns">
          {COLUNAS.map((col) => {
            const items = filtered.filter((o) => o.status === col.status);
            return (
              <Column key={col.status} label={col.label} color={col.color} count={items.length}>
                {items.map((os) => {
                  const fotoCount = anexosMeta.filter(
                    (a) => a.os_id === os.id && a.tipo === 'foto'
                  ).length;
                  const temNotaFiscal = anexosMeta.some(
                    (a) => a.os_id === os.id && a.tipo === 'nota_fiscal'
                  );
                  return (
                    <OSCard
                      key={os.id}
                      os={os}
                      fotoCount={fotoCount}
                      temNotaFiscal={temNotaFiscal}
                      onOpen={() => onOpen(os)}
                      onAceitar={() => handleStatusChange(os, 'afazer')}
                      onStatusChange={(s) => handleStatusChange(os, s)}
                    />
                  );
                })}
                {items.length === 0 && <div className="kanban-empty">Nenhuma O.S.</div>}
              </Column>
            );
          })}
        </div>
      )}
    </div>
  );
}
