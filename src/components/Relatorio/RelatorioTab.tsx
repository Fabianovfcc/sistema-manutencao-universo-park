import { useMemo } from 'react';
import type { OS, Rotina } from '../../types';
import { CATEGORIAS } from '../../types';
import { formatDateBR, formatMoney, formatOSNumero, daysBetween, isAtrasado, addDaysISO, todayISO } from '../../lib/format';

interface Props {
  osList: OS[];
  rotinas: Rotina[];
}

export default function RelatorioTab({ osList, rotinas }: Props) {
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
