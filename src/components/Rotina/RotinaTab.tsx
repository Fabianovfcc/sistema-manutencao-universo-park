import { useState } from 'react';
import type { Rotina } from '../../types';
import { formatDateBR, addDaysISO, todayISO } from '../../lib/format';
import { whatsappLink } from '../../lib/whatsapp';
import { updateRotina } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { ChecklistData } from '../../hooks/useChecklist';
import RotinaModal from './RotinaModal';
import ChecklistDiarioSection from './ChecklistDiarioSection';

interface Props {
  rotinas: Rotina[];
  loading: boolean;
  onChanged: () => void;
  checklist: ChecklistData;
}

function mensagemConfirmacao(r: Rotina, dataAlvo: string): string {
  const template =
    r.mensagem_modelo?.trim() ||
    `Olá! Passando para confirmar a '${r.titulo}' agendada para {data} no Universo Park. Pode confirmar?`;
  return template.replace('{data}', formatDateBR(dataAlvo));
}

export default function RotinaTab({ rotinas, loading, onChanged, checklist }: Props) {
  const { socioNome } = useAuth();
  const [editando, setEditando] = useState<Rotina | 'new' | null>(null);

  async function marcarFeitoHoje(r: Rotina) {
    await updateRotina(r.id, { ultima_execucao: todayISO() });
    onChanged();
  }

  function confirmarD(r: Rotina, diasAFrente: number) {
    if (!r.telefone_fornecedor) {
      alert('Esta tarefa não tem um fornecedor com WhatsApp cadastrado.');
      return;
    }
    const dataAlvo = addDaysISO(todayISO(), diasAFrente);
    const msg = mensagemConfirmacao(r, dataAlvo);
    window.open(whatsappLink(r.telefone_fornecedor, msg), '_blank');
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <ChecklistDiarioSection data={checklist} socioNome={socioNome} />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

      <div>
        <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 12 }}>
          Tarefas com fornecedor fixo
        </h3>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button className="btn btn-primary" onClick={() => setEditando('new')}>
            + Nova tarefa recorrente
          </button>
        </div>

        {loading ? (
        <div style={{ color: 'var(--text-2)' }}>Carregando...</div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Frequência</th>
                <th>Fornecedor</th>
                <th>Responsável</th>
                <th>Última vez</th>
                <th>Próxima</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rotinas.map((r) => {
                const base = r.ultima_execucao ?? r.created_at.slice(0, 10);
                const proxima = addDaysISO(base, r.freq_dias);
                const vencida = proxima < todayISO();
                return (
                  <tr key={r.id} style={vencida ? { background: 'color-mix(in srgb, var(--red) 8%, transparent)' } : undefined}>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 0, fontWeight: 600 }}
                        onClick={() => setEditando(r)}
                      >
                        {r.titulo}
                      </button>
                    </td>
                    <td>{freqLabel(r.freq_dias)}</td>
                    <td>{r.fornecedor || '—'}</td>
                    <td>{r.responsavel || '—'}</td>
                    <td className="mono">{r.ultima_execucao ? formatDateBR(r.ultima_execucao) : '—'}</td>
                    <td className="mono">
                      {formatDateBR(proxima)}
                      {vencida && (
                        <span className="tag tag-red" style={{ marginLeft: 6 }}>
                          vencida
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => marcarFeitoHoje(r)}>
                          Feito hoje
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => confirmarD(r, 1)}>
                          D-1
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => confirmarD(r, 2)}>
                          D-2
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rotinas.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-2)' }}>
                    Nenhuma tarefa recorrente cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {editando && (
        <RotinaModal
          rotina={editando === 'new' ? null : editando}
          onClose={() => setEditando(null)}
          onSaved={onChanged}
        />
      )}
    </div>
  );
}

function freqLabel(dias: number): string {
  const map: Record<number, string> = {
    1: 'Diária',
    7: 'Semanal',
    15: 'Quinzenal',
    30: 'Mensal',
    90: 'Trimestral',
    180: 'Semestral',
  };
  return map[dias] ?? `${dias} dias`;
}
