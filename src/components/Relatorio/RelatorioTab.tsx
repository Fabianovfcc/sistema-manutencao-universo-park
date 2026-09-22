import { useMemo, useState } from 'react';
import type { OS, Rotina } from '../../types';
import { CATEGORIAS, CHECKLIST_STATUS_LABEL } from '../../types';
import { formatDateBR, formatMoney, formatOSNumero, daysBetween, isAtrasado, addDaysISO, todayISO } from '../../lib/format';
import type { ChecklistData } from '../../hooks/useChecklist';
import DateRangePicker from './DateRangePicker';

interface Props {
  osList: OS[];
  rotinas: Rotina[];
  checklist: ChecklistData;
}

export default function RelatorioTab({ osList, rotinas, checklist }: Props) {
  const [mostrandoCalendario, setMostrandoCalendario] = useState(false);

  async function baixarRelatorio(inicio: string, fim: string) {
    const filtradas = osList.filter((o) => o.data_abertura >= inicio && o.data_abertura <= fim);
    const { gerarRelatorioPDF } = await import('../../lib/pdf');
    gerarRelatorioPDF(filtradas, inicio, fim);
    setMostrandoCalendario(false);
  }

  const itensPorId = useMemo(() => new Map(checklist.itens.map((i) => [i.id, i])), [checklist.itens]);
  const respostasPorDiario = useMemo(() => {
    const map = new Map<string, typeof checklist.respostas>();
    for (const r of checklist.respostas) {
      const lista = map.get(r.checklist_diario_id) ?? [];
      lista.push(r);
      map.set(r.checklist_diario_id, lista);
    }
    return map;
  }, [checklist.respostas]);
  const resolvidas = useMemo(
    () => osList.filter((o) => o.status === 'resolvido' && o.data_resolucao),
    [osList]
  );

  const totalGasto = resolvidas.reduce((sum, o) => sum + (o.preco || 0), 0);

  const tempoMedio = useMemo(() => {
    if (resolvidas.length === 0) return 0;
    const total = resolvidas.reduce(
      (sum, o) => sum + daysBetween(o.data_abertura, o.data_resolucao as string),
      0
    );
    return Math.round((total / resolvidas.length) * 10) / 10;
  }, [resolvidas]);

  const emAberto = osList.filter((o) => o.status !== 'resolvido').length;
  const atrasadas = osList.filter((o) => isAtrasado(o.data_prevista, o.status)).length;

  const rotinasVencidas = rotinas.filter((r) => {
    const base = r.ultima_execucao ?? r.created_at.slice(0, 10);
    return addDaysISO(base, r.freq_dias) < todayISO();
  }).length;

  const gastoPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of CATEGORIAS) map.set(c, 0);
    for (const o of resolvidas) map.set(o.categoria, (map.get(o.categoria) ?? 0) + (o.preco || 0));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [resolvidas]);

  const maxGasto = Math.max(1, ...gastoPorCategoria.map(([, v]) => v));

  const historico = useMemo(
    () =>
      [...resolvidas].sort(
        (a, b) => new Date(b.data_resolucao as string).getTime() - new Date(a.data_resolucao as string).getTime()
      ),
    [resolvidas]
  );

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={() => setMostrandoCalendario(true)}>
          Baixar relatório
        </button>
      </div>

      <div className="stat-grid">
        <Stat label="O.S. resolvidas" value={resolvidas.length} color="var(--green)" />
        <Stat label="Total gasto em manutenção" value={formatMoney(totalGasto)} color="var(--blue)" />
        <Stat label="Tempo médio de resolução" value={`${tempoMedio} dias`} color="var(--blue)" />
        <Stat label="O.S. em aberto agora" value={emAberto} color="var(--orange)" />
        <Stat label="O.S. atrasadas" value={atrasadas} color="var(--red)" />
        <Stat label="Tarefas de rotina vencidas" value={rotinasVencidas} color="var(--red)" />
      </div>

      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-2)' }}>
          Gasto por categoria
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {gastoPorCategoria.map(([cat, valor]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 130, fontSize: 12, color: 'var(--text-2)' }}>{cat}</div>
              <div style={{ flex: 1, background: 'var(--panel-2)', borderRadius: 6, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(valor / maxGasto) * 100}%`,
                    background: 'var(--blue)',
                    height: 18,
                    minWidth: valor > 0 ? 4 : 0,
                  }}
                />
              </div>
              <div className="mono" style={{ width: 100, textAlign: 'right', fontSize: 12 }}>
                {formatMoney(valor)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Título</th>
              <th>Categoria</th>
              <th>Sócio</th>
              <th>Aberto</th>
              <th>Resolvido</th>
              <th>Dias</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((o) => (
              <tr key={o.id}>
                <td className="mono">{formatOSNumero(o.numero)}</td>
                <td>{o.titulo}</td>
                <td>{o.categoria}</td>
                <td>{o.socio_responsavel || '—'}</td>
                <td className="mono">{formatDateBR(o.data_abertura)}</td>
                <td className="mono">{formatDateBR(o.data_resolucao)}</td>
                <td className="mono">{daysBetween(o.data_abertura, o.data_resolucao as string)}</td>
                <td className="mono">{formatMoney(o.preco)}</td>
              </tr>
            ))}
            {historico.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-2)' }}>
                  Nenhuma O.S. resolvida ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-2)' }}>
          Checklist diário de abertura
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {checklist.diarios.map((d) => {
            const respostas = respostasPorDiario.get(d.id) ?? [];
            const hora = new Date(d.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={d.id} style={{ padding: 12, borderRadius: 8, background: 'var(--panel-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <strong>Checklist — {formatDateBR(d.data)}</strong>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {d.feito_por || 'não identificado'} · {hora}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {respostas.length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Nenhum item respondido.</div>
                  )}
                  {respostas.map((r) => {
                    const item = itensPorId.get(r.checklist_item_id);
                    const problema = r.status === 'nao_funcionando';
                    return (
                      <div
                        key={r.id}
                        style={{
                          fontSize: 13,
                          color: problema ? 'var(--red)' : 'var(--text)',
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>{item?.titulo ?? '(item removido)'}:</span>
                        <span style={{ fontWeight: 600 }}>{CHECKLIST_STATUS_LABEL[r.status]}</span>
                        {problema && r.descricao_problema && <span>— {r.descricao_problema}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {checklist.diarios.length === 0 && (
            <div style={{ color: 'var(--text-2)', fontSize: 13 }}>Nenhum checklist registrado ainda.</div>
          )}
        </div>
      </div>

      {mostrandoCalendario && (
        <DateRangePicker onConfirm={baixarRelatorio} onClose={() => setMostrandoCalendario(false)} />
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="card stat-card">
      <div className="value" style={{ color }}>
        {value}
      </div>
      <div className="label">{label}</div>
    </div>
  );
}
