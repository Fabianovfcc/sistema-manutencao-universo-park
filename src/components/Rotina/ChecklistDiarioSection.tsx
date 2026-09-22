import { useEffect, useMemo, useState } from 'react';
import type { ChecklistData } from '../../hooks/useChecklist';
import {
  getOrCreateChecklistHoje,
  setChecklistFeitoPor,
  upsertChecklistResposta,
  createChecklistItem,
  updateChecklistItem,
} from '../../lib/api';
import { todayISO, formatDateBR } from '../../lib/format';
import type { ChecklistStatus } from '../../types';

interface Props {
  data: ChecklistData;
  socioNome: string;
}

export default function ChecklistDiarioSection({ data, socioNome }: Props) {
  const hoje = todayISO();
  const [gerenciando, setGerenciando] = useState(false);
  const [novoItemTitulo, setNovoItemTitulo] = useState('');
  const [descrevendoId, setDescrevendoId] = useState<string | null>(null);
  const [descricaoTexto, setDescricaoTexto] = useState('');
  const [feitoPorInput, setFeitoPorInput] = useState(socioNome);

  useEffect(() => {
    if (data.loading) return;
    const existe = data.diarios.some((d) => d.data === hoje);
    if (!existe) {
      getOrCreateChecklistHoje(hoje).then(() => data.reload());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.loading]);

  const diarioHoje = useMemo(() => data.diarios.find((d) => d.data === hoje), [data.diarios, hoje]);

  useEffect(() => {
    if (diarioHoje) setFeitoPorInput(diarioHoje.feito_por ?? socioNome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diarioHoje?.id]);

  const respostasHoje = useMemo(
    () => (diarioHoje ? data.respostas.filter((r) => r.checklist_diario_id === diarioHoje.id) : []),
    [data.respostas, diarioHoje]
  );

  const itensAtivos = useMemo(
    () => data.itens.filter((i) => i.ativo).sort((a, b) => a.ordem - b.ordem),
    [data.itens]
  );

  async function salvarFeitoPor() {
    if (!diarioHoje || !feitoPorInput.trim()) return;
    if (feitoPorInput.trim() === (diarioHoje.feito_por ?? '')) return;
    await setChecklistFeitoPor(diarioHoje.id, feitoPorInput.trim());
    data.reload();
  }

  async function marcarOk(itemId: string) {
    if (!diarioHoje) return;
    setDescrevendoId(null);
    await upsertChecklistResposta(diarioHoje.id, itemId, 'ok', null);
    data.reload();
  }

  function abrirDescricao(itemId: string, atual: string) {
    setDescrevendoId(itemId);
    setDescricaoTexto(atual);
  }

  async function salvarProblema(itemId: string) {
    if (!diarioHoje || !descricaoTexto.trim()) return;
    await upsertChecklistResposta(diarioHoje.id, itemId, 'nao_funcionando', descricaoTexto.trim());
    setDescrevendoId(null);
    setDescricaoTexto('');
    data.reload();
  }

  async function adicionarItem() {
    if (!novoItemTitulo.trim()) return;
    const proximaOrdem = data.itens.length > 0 ? Math.max(...data.itens.map((i) => i.ordem)) + 1 : 1;
    await createChecklistItem(novoItemTitulo.trim(), proximaOrdem);
    setNovoItemTitulo('');
    data.reload();
  }

  async function renomearItem(id: string, titulo: string) {
    await updateChecklistItem(id, { titulo });
    data.reload();
  }

  async function alternarAtivo(id: string, ativo: boolean) {
    await updateChecklistItem(id, { ativo });
    data.reload();
  }

  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-2)' }}>
            Checklist diário de abertura — {formatDateBR(hoje)}
          </h3>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGerenciando((v) => !v)}>
          {gerenciando ? 'Fechar gerenciamento' : 'Gerenciar itens'}
        </button>
      </div>

      <div className="field" style={{ maxWidth: 280 }}>
        <label>Feito por</label>
        <input
          value={feitoPorInput}
          onChange={(e) => setFeitoPorInput(e.target.value)}
          onBlur={salvarFeitoPor}
          placeholder="Nome de quem está checando"
        />
      </div>

      {gerenciando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, background: 'var(--panel-2)', borderRadius: 8 }}>
          {data.itens
            .slice()
            .sort((a, b) => a.ordem - b.ordem)
            .map((item) => (
              <ItemGerenciavel
                key={item.id}
                titulo={item.titulo}
                ativo={item.ativo}
                onRenomear={(titulo) => renomearItem(item.id, titulo)}
                onAlternarAtivo={(ativo) => alternarAtivo(item.id, ativo)}
              />
            ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Novo item do checklist"
              value={novoItemTitulo}
              onChange={(e) => setNovoItemTitulo(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={adicionarItem}>
              + Adicionar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {itensAtivos.map((item) => {
          const resposta = respostasHoje.find((r) => r.checklist_item_id === item.id);
          const status: ChecklistStatus | undefined = resposta?.status;
          return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 10px', borderRadius: 8, background: 'var(--panel-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>{item.titulo}</div>
                <button
                  type="button"
                  className={status === 'ok' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                  onClick={() => marcarOk(item.id)}
                >
                  Funcionando / OK
                </button>
                <button
                  type="button"
                  className={status === 'nao_funcionando' ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm'}
                  onClick={() => abrirDescricao(item.id, resposta?.descricao_problema ?? '')}
                >
                  Não está funcionando
                </button>
              </div>
              {status === 'nao_funcionando' && descrevendoId !== item.id && (
                <div style={{ fontSize: 12, color: 'var(--red)' }}>{resposta?.descricao_problema}</div>
              )}
              {descrevendoId === item.id && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <textarea
                    rows={2}
                    autoFocus
                    placeholder="Descreva o problema (obrigatório)"
                    value={descricaoTexto}
                    onChange={(e) => setDescricaoTexto(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!descricaoTexto.trim()}
                    onClick={() => salvarProblema(item.id)}
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {itensAtivos.length === 0 && (
          <div style={{ color: 'var(--text-2)', fontSize: 13 }}>Nenhum item cadastrado no checklist.</div>
        )}
      </div>
    </div>
  );
}

function ItemGerenciavel({
  titulo,
  ativo,
  onRenomear,
  onAlternarAtivo,
}: {
  titulo: string;
  ativo: boolean;
  onRenomear: (titulo: string) => void;
  onAlternarAtivo: (ativo: boolean) => void;
}) {
  const [texto, setTexto] = useState(titulo);

  useEffect(() => setTexto(titulo), [titulo]);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={() => {
          if (texto.trim() && texto !== titulo) onRenomear(texto.trim());
        }}
        style={{ flex: 1, opacity: ativo ? 1 : 0.5 }}
      />
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
        <input type="checkbox" checked={ativo} onChange={(e) => onAlternarAtivo(e.target.checked)} />
        Ativo
      </label>
    </div>
  );
}
