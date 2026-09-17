import { useEffect, useMemo, useState } from 'react';
import type { OS, Categoria, Prioridade, Status } from '../../types';
import { CATEGORIAS, PRIORIDADES, STATUS_LABEL } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { compressImage } from '../../lib/image';
import { formatDateBR, formatMoney, formatOSNumero, todayISO } from '../../lib/format';
import {
  createOS,
  updateOS,
  deleteOS,
  fetchOrcamentos,
  addOrcamento,
  updateOrcamentoFields,
  deleteOrcamento,
  setOrcamentoAprovado,
  fetchAnexos,
  uploadAnexo,
  deleteAnexo,
  anexoSignedUrl,
  fetchLog,
  addLogEntry,
} from '../../lib/api';
import type { Orcamento, Anexo } from '../../types';
import type { UIOrcamento, UIAnexo, UILogEntry } from './types';
import VoiceDictationButton from './VoiceDictationButton';
import OrcamentosSection from './OrcamentosSection';
import AnexosSection from './AnexosSection';
import WhatsAppSection from './WhatsAppSection';
import HistoricoSection from './HistoricoSection';
import '../../styles/common.css';

interface Props {
  os: OS | null;
  osList: OS[];
  onClose: () => void;
  onSaved: () => void;
}

const WHATS_KEY = 'manutencao_whatsapp_numero';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

async function processFileForAnexo(file: File): Promise<{ blob: Blob; ext: string }> {
  if (file.type === 'application/pdf') {
    return { blob: file, ext: 'pdf' };
  }
  const blob = await compressImage(file);
  return { blob, ext: 'jpg' };
}

export default function OSModal({ os, osList, onClose, onSaved }: Props) {
  const { socioNome } = useAuth();
  const isNew = !os;

  const [titulo, setTitulo] = useState(os?.titulo ?? '');
  const [categoria, setCategoria] = useState<Categoria>(os?.categoria ?? 'Elétrica');
  const [prioridade, setPrioridade] = useState<Prioridade>(os?.prioridade ?? 'Média');
  const [descricao, setDescricao] = useState(os?.descricao ?? '');
  const [dataAbertura, setDataAbertura] = useState(os?.data_abertura ?? todayISO());
  const [dataPrevista, setDataPrevista] = useState(os?.data_prevista ?? '');
  const [status, setStatus] = useState<Status>(os?.status ?? 'afazer');
  const [solicitante, setSolicitante] = useState(os?.solicitante ?? socioNome);
  const [socioResponsavel, setSocioResponsavel] = useState(os?.socio_responsavel ?? socioNome);
  const [empresaExecutante, setEmpresaExecutante] = useState(os?.empresa_executante ?? '');
  const [responsavelContato, setResponsavelContato] = useState(os?.responsavel_contato ?? '');
  const [preco, setPreco] = useState(os?.preco ?? 0);

  const [orcamentos, setOrcamentos] = useState<UIOrcamento[]>([]);
  const [fotos, setFotos] = useState<UIAnexo[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<UIAnexo[]>([]);
  const [log, setLog] = useState<UILogEntry[]>([]);
  const [pendingLog, setPendingLog] = useState<string[]>([]);

  const [numeroWhats, setNumeroWhats] = useState(() => localStorage.getItem(WHATS_KEY) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!os) return;
    fetchOrcamentos(os.id).then((rows: Orcamento[]) =>
      setOrcamentos(
        rows.map((r) => ({
          id: r.id,
          empresa: r.empresa ?? '',
          contato: r.contato ?? '',
          valor: r.valor ?? 0,
          aprovado: r.aprovado,
        }))
      )
    );
    fetchAnexos(os.id).then(async (rows: Anexo[]) => {
      const ui = await Promise.all(
        rows.map(async (a) => ({
          id: a.id,
          tipo: a.tipo,
          url: await anexoSignedUrl(a.storage_path),
          isPdf: a.storage_path.endsWith('.pdf'),
          storagePath: a.storage_path,
        }))
      );
      setFotos(ui.filter((a) => a.tipo === 'foto'));
      setNotasFiscais(ui.filter((a) => a.tipo === 'nota_fiscal'));
    });
    fetchLog(os.id).then((rows) =>
      setLog(rows.map((r) => ({ id: r.id, autor: r.autor ?? '', texto: r.texto, createdAt: r.created_at })))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [os?.id]);

  const sugestoesSocios = useMemo(
    () => Array.from(new Set(osList.map((o) => o.socio_responsavel).filter(Boolean))) as string[],
    [osList]
  );
  const sugestoesSolicitantes = useMemo(
    () => Array.from(new Set(osList.map((o) => o.solicitante).filter(Boolean))) as string[],
    [osList]
  );

  function appendDescricao(chunk: string) {
    setDescricao((prev) => (prev ? `${prev} ${chunk}` : chunk));
  }

  // ---- Orçamentos ----
  function addOrcamentoRow() {
    if (isNew) {
      setOrcamentos((prev) => [...prev, { id: uid(), empresa: '', contato: '', valor: 0, aprovado: false }]);
    } else if (os) {
      addOrcamento(os.id, { empresa: '', contato: '', valor: 0 }).then((r) =>
        setOrcamentos((prev) => [
          ...prev,
          { id: r.id, empresa: '', contato: '', valor: 0, aprovado: false },
        ])
      );
    }
  }

  function changeOrcamentoRow(id: string, patch: Partial<UIOrcamento>) {
    setOrcamentos((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    if (!isNew) {
      updateOrcamentoFields(id, patch).catch(() => {});
    }
  }

  function removeOrcamentoRow(id: string) {
    setOrcamentos((prev) => prev.filter((o) => o.id !== id));
    if (!isNew) deleteOrcamento(id).catch(() => {});
  }

  async function usarOrcamentoRow(id: string) {
    const o = orcamentos.find((x) => x.id === id);
    if (!o) return;
    setEmpresaExecutante(o.empresa);
    setResponsavelContato(o.contato);
    setPreco(o.valor);
    setOrcamentos((prev) => prev.map((x) => ({ ...x, aprovado: x.id === id })));
    if (!isNew && os) await setOrcamentoAprovado(os.id, id);
  }

  // ---- Anexos ----
  async function addAnexos(files: FileList, tipo: 'foto' | 'nota_fiscal') {
    const setter = tipo === 'foto' ? setFotos : setNotasFiscais;
    for (const file of Array.from(files)) {
      const { blob, ext } = await processFileForAnexo(file);
      const finalIsPdf = file.type === 'application/pdf';
      if (isNew) {
        const url = URL.createObjectURL(blob);
        setter((prev) => [
          ...prev,
          { id: uid(), tipo, url, isPdf: finalIsPdf, file: new File([blob], `anexo.${ext}`, { type: blob.type || file.type }) },
        ]);
      } else if (os) {
        const anexo = await uploadAnexo(os.id, tipo, blob, ext);
        const url = await anexoSignedUrl(anexo.storage_path);
        setter((prev) => [
          ...prev,
          { id: anexo.id, tipo, url, isPdf: finalIsPdf, storagePath: anexo.storage_path },
        ]);
      }
    }
  }

  function removeAnexo(id: string, tipo: 'foto' | 'nota_fiscal') {
    const setter = tipo === 'foto' ? setFotos : setNotasFiscais;
    const list = tipo === 'foto' ? fotos : notasFiscais;
    const item = list.find((a) => a.id === id);
    if (!item) return;
    setter((prev) => prev.filter((a) => a.id !== id));
    if (isNew) {
      URL.revokeObjectURL(item.url);
    } else if (item.storagePath) {
      deleteAnexo({
        id,
        os_id: os!.id,
        tipo,
        storage_path: item.storagePath,
        created_at: '',
      } as Anexo).catch(() => {});
    }
  }

  // ---- Histórico ----
  function adicionarComentario(texto: string) {
    if (isNew) {
      setPendingLog((prev) => [...prev, texto]);
      setLog((prev) => [{ id: uid(), autor: socioNome, texto, createdAt: new Date().toISOString() }, ...prev]);
    } else if (os) {
      addLogEntry(os.id, socioNome, texto).then((r) =>
        setLog((prev) => [{ id: r.id, autor: r.autor ?? '', texto: r.texto, createdAt: r.created_at }, ...prev])
      );
    }
  }

  // ---- WhatsApp ----
  function handleNumeroChange(v: string) {
    setNumeroWhats(v);
    localStorage.setItem(WHATS_KEY, v);
  }

  const mensagemWhats = useMemo(() => {
    const numeroOS = os ? formatOSNumero(os.numero) : '(nova O.S.)';
    return [
      `*${numeroOS}* - ${titulo || '(sem título)'}`,
      `Status: ${STATUS_LABEL[status]}`,
      `Prioridade: ${prioridade}`,
      `Categoria: ${categoria}`,
      `Solicitante: ${solicitante || '-'}`,
      `Responsável: ${socioResponsavel || '-'}`,
      `Empresa: ${empresaExecutante || '-'}`,
      `Preço: ${formatMoney(preco)}`,
      `Prazo: ${dataPrevista ? formatDateBR(dataPrevista) : '-'}`,
    ].join('\n');
  }, [os, titulo, status, prioridade, categoria, solicitante, socioResponsavel, empresaExecutante, preco, dataPrevista]);

  // ---- Salvar / Excluir ----
  async function handleSalvar() {
    if (!titulo.trim()) {
      setError('Informe o título da O.S.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        titulo: titulo.trim(),
        categoria,
        prioridade,
        descricao,
        status,
        solicitante,
        socio_responsavel: socioResponsavel,
        empresa_executante: empresaExecutante,
        responsavel_contato: responsavelContato,
        preco,
        data_abertura: dataAbertura,
        data_prevista: dataPrevista || null,
      };

      if (isNew) {
        const created = await createOS(payload);
        for (const o of orcamentos) {
          const r = await addOrcamento(created.id, { empresa: o.empresa, contato: o.contato, valor: o.valor });
          if (o.aprovado) await setOrcamentoAprovado(created.id, r.id);
        }
        for (const f of fotos) {
          if (f.file) await uploadAnexo(created.id, 'foto', f.file, f.file.name.split('.').pop() || 'jpg');
        }
        for (const n of notasFiscais) {
          if (n.file) await uploadAnexo(created.id, 'nota_fiscal', n.file, n.file.name.split('.').pop() || 'jpg');
        }
        await addLogEntry(created.id, socioNome, 'O.S. criada');
        for (const texto of pendingLog) {
          await addLogEntry(created.id, socioNome, texto);
        }
      } else if (os) {
        const statusMudou = os.status !== status;
        await updateOS(os.id, {
          ...payload,
          data_resolucao: status === 'resolvido' ? os.data_resolucao ?? todayISO() : null,
        });
        if (statusMudou) {
          await addLogEntry(os.id, socioNome, `Status alterado para ${STATUS_LABEL[status]}`);
        }
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleExcluir() {
    if (!os) return;
    if (!confirm(`Excluir a O.S. ${formatOSNumero(os.numero)}? Esta ação não pode ser desfeita.`)) return;
    setSaving(true);
    try {
      await deleteOS(os.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isNew ? 'Nova O.S.' : `${formatOSNumero(os!.numero)} — ${os!.titulo}`}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}

          <div className="modal-section">
            <h3>Dados da ordem de serviço</h3>
            <div className="field">
              <label>Título</label>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Trocar disjuntor do brinquedão" />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Prioridade</label>
                <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)}>
                  {PRIORIDADES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Descrição</span>
                <VoiceDictationButton onResult={appendDescricao} />
              </label>
              <textarea rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Data de abertura</label>
                <input type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} />
              </div>
              <div className="field">
                <label>Prazo previsto</label>
                <input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option value="solicitacao">Solicitação (aguardando aceite de um sócio)</option>
                <option value="afazer">{STATUS_LABEL.afazer}</option>
                <option value="andamento">{STATUS_LABEL.andamento}</option>
                <option value="aguardando">{STATUS_LABEL.aguardando}</option>
                <option value="resolvido">{STATUS_LABEL.resolvido}</option>
              </select>
            </div>
          </div>

          <div className="modal-section">
            <h3>Quem pediu / quem executa</h3>
            <div className="field-row">
              <div className="field">
                <label>Solicitado por</label>
                <input list="solicitantes" value={solicitante} onChange={(e) => setSolicitante(e.target.value)} />
                <datalist id="solicitantes">
                  {sugestoesSolicitantes.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="field">
                <label>Sócio responsável por resolver</label>
                <input list="socios" value={socioResponsavel} onChange={(e) => setSocioResponsavel(e.target.value)} />
                <datalist id="socios">
                  {sugestoesSocios.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3>Execução</h3>
            <div className="field-row">
              <div className="field">
                <label>Empresa executante</label>
                <input value={empresaExecutante} onChange={(e) => setEmpresaExecutante(e.target.value)} />
              </div>
              <div className="field">
                <label>Contato / responsável técnico</label>
                <input value={responsavelContato} onChange={(e) => setResponsavelContato(e.target.value)} />
              </div>
            </div>
            <div className="field" style={{ maxWidth: 200 }}>
              <label>Preço do serviço (R$)</label>
              <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(Number(e.target.value))} />
            </div>
          </div>

          <OrcamentosSection
            orcamentos={orcamentos}
            onAdd={addOrcamentoRow}
            onChange={changeOrcamentoRow}
            onRemove={removeOrcamentoRow}
            onUsar={usarOrcamentoRow}
          />

          <AnexosSection
            titulo="Fotos (quantas precisar)"
            anexos={fotos}
            accept="image/*"
            onAdd={(files) => addAnexos(files, 'foto')}
            onRemove={(id) => removeAnexo(id, 'foto')}
          />

          <AnexosSection
            titulo="Nota fiscal / comprovante"
            anexos={notasFiscais}
            accept="image/*,application/pdf"
            onAdd={(files) => addAnexos(files, 'nota_fiscal')}
            onRemove={(id) => removeAnexo(id, 'nota_fiscal')}
          />

          <WhatsAppSection numero={numeroWhats} onNumeroChange={handleNumeroChange} mensagem={mensagemWhats} />

          <HistoricoSection entradas={log} onAdicionar={adicionarComentario} />
        </div>

        <div className="modal-footer">
          <div>
            {!isNew && (
              <button className="btn btn-danger btn-sm" onClick={handleExcluir} disabled={saving}>
                Excluir esta O.S.
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSalvar} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
