import { useState } from 'react';
import { formatDateBR } from '../../lib/format';

interface Props {
  onConfirm: (inicio: string, fim: string) => void;
  onClose: () => void;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function DateRangePicker({ onConfirm, onClose }: Props) {
  const hoje = new Date();
  const [viewYear, setViewYear] = useState(hoje.getFullYear());
  const [viewMonth, setViewMonth] = useState(hoje.getMonth());
  const [inicio, setInicio] = useState<string | null>(null);
  const [fim, setFim] = useState<string | null>(null);

  function mudarMes(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function clicarDia(iso: string) {
    if (!inicio || (inicio && fim)) {
      setInicio(iso);
      setFim(null);
    } else if (iso < inicio) {
      setInicio(iso);
      setFim(null);
    } else {
      setFim(iso);
    }
  }

  const primeiroDiaSemana = new Date(viewYear, viewMonth, 1).getDay();
  const totalDias = new Date(viewYear, viewMonth + 1, 0).getDate();
  const celulas: (string | null)[] = [];
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null);
  for (let d = 1; d <= totalDias; d++) celulas.push(toISO(viewYear, viewMonth, d));

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h2>Baixar relatório por período</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => mudarMes(-1)}>
              ←
            </button>
            <strong>
              {MESES[viewMonth]} {viewYear}
            </strong>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => mudarMes(1)}>
              →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, fontSize: 11, color: 'var(--text-2)', textAlign: 'center' }}>
            {DIAS_SEMANA.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {celulas.map((iso, i) => {
              if (!iso) return <div key={i} />;
              const selecionado = iso === inicio || iso === fim;
              const noIntervalo = inicio && fim && iso > inicio && iso < fim;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => clicarDia(iso)}
                  style={{
                    padding: '6px 0',
                    fontSize: 12,
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: selecionado ? 'var(--blue)' : noIntervalo ? 'color-mix(in srgb, var(--blue) 18%, transparent)' : 'var(--panel-2)',
                    color: selecionado ? '#fff' : 'var(--text)',
                  }}
                >
                  {Number(iso.slice(-2))}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {inicio ? `De ${formatDateBR(inicio)}` : 'Selecione a data inicial'}
            {fim ? ` até ${formatDateBR(fim)}` : inicio ? ' — selecione a data final' : ''}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!inicio || !fim}
            onClick={() => inicio && fim && onConfirm(inicio, fim)}
          >
            Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
