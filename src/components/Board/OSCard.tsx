import type { OS, Status } from '../../types';
import { COLUNAS, STATUS_LABEL } from '../../types';
import { formatDateBR, formatMoney, formatOSNumero, daysAgo, isAtrasado } from '../../lib/format';

interface Props {
  os: OS;
  fotoCount: number;
  temNotaFiscal: boolean;
  onOpen: () => void;
  onAceitar: () => void;
  onStatusChange: (status: Status) => void;
}

const PRIORIDADE_TAG: Record<string, string> = {
  Baixa: 'tag-green',
  Média: 'tag-blue',
  Alta: 'tag-amber',
  Urgente: 'tag-orange',
};

export default function OSCard({
  os,
  fotoCount,
  temNotaFiscal,
  onOpen,
  onAceitar,
  onStatusChange,
}: Props) {
  const atrasado = isAtrasado(os.data_prevista, os.status);

  return (
    <div className="card os-card" onClick={onOpen}>
      <div className="os-card-top">
        <span className="mono os-card-numero">{formatOSNumero(os.numero)}</span>
        {os.socio_responsavel && <span className="os-card-socio">{os.socio_responsavel}</span>}
      </div>

      {os.status === 'solicitacao' && (os.solicitante || os.socio_responsavel) && (
        <div className="os-card-request">
          {os.solicitante || '—'} → {os.socio_responsavel || '—'}
        </div>
      )}

      <div className="os-card-title">{os.titulo}</div>

      <div className="os-card-tags">
        <span className="tag tag-neutral">{os.categoria}</span>
        <span className={`tag ${PRIORIDADE_TAG[os.prioridade] ?? 'tag-neutral'}`}>
          {os.prioridade}
        </span>
        {atrasado && <span className="tag tag-red">Atrasado</span>}
      </div>

      <div className="os-card-meta">
        {fotoCount > 0 && <span>📷 {fotoCount}</span>}
        {temNotaFiscal && <span>🧾</span>}
        {os.data_prevista && <span>Prazo {formatDateBR(os.data_prevista)}</span>}
        {os.preco > 0 && <span>{formatMoney(os.preco)}</span>}
      </div>

      <div className="os-card-footer">
        Aberta em {formatDateBR(os.data_abertura)} · atualizado há {daysAgo(os.updated_at)}{' '}
        {daysAgo(os.updated_at) === 1 ? 'dia' : 'dias'}
      </div>

      {os.status === 'solicitacao' && (
        <button
          className="btn btn-primary btn-sm os-card-accept"
          onClick={(e) => {
            e.stopPropagation();
            onAceitar();
          }}
        >
          Aceitar e mover para A Fazer
        </button>
      )}

      <select
        className="os-card-select"
        value={os.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStatusChange(e.target.value as Status)}
      >
        {COLUNAS.map((c) => (
          <option key={c.status} value={c.status}>
            {STATUS_LABEL[c.status]}
          </option>
        ))}
      </select>
    </div>
  );
}
