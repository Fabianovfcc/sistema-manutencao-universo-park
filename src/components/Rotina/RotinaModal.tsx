import { useState } from 'react';
import type { Rotina } from '../../types';
import { FREQUENCIAS } from '../../types';
import { createRotina, updateRotina, deleteRotina } from '../../lib/api';

interface Props {
  rotina: Rotina | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function RotinaModal({ rotina, onClose, onSaved }: Props) {
  const isNew = !rotina;
  const [titulo, setTitulo] = useState(rotina?.titulo ?? '');
  const [freqDias, setFreqDias] = useState(rotina?.freq_dias ?? 30);
  const [responsavel, setResponsavel] = useState(rotina?.responsavel ?? '');
  const [fornecedor, setFornecedor] = useState(rotina?.fornecedor ?? '');
  const [telefoneFornecedor, setTelefoneFornecedor] = useState(rotina?.telefone_fornecedor ?? '');
  const [mensagemModelo, setMensagemModelo] = useState(rotina?.mensagem_modelo ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSalvar() {
    if (!titulo.trim()) {
      setError('Informe o título da tarefa.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        titulo: titulo.trim(),
        freq_dias: freqDias,
        responsavel: responsavel || null,
        fornecedor: fornecedor || null,
        telefone_fornecedor: telefoneFornecedor || null,
        mensagem_modelo: mensagemModelo || null,
        ultima_execucao: rotina?.ultima_execucao ?? null,
      };
      if (isNew) {
        await createRotina(payload);
      } else {
        await updateRotina(rotina.id, payload);
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
    if (!rotina) return;
    if (!confirm(`Excluir a tarefa recorrente "${rotina.titulo}"?`)) return;
    setSaving(true);
    try {
      await deleteRotina(rotina.id);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>{isNew ? 'Nova tarefa recorrente' : 'Editar tarefa recorrente'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}
          <div className="field">
            <label>Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="field">
            <label>Frequência</label>
            <select value={freqDias} onChange={(e) => setFreqDias(Number(e.target.value))}>
              {FREQUENCIAS.map((f) => (
                <option key={f.dias} value={f.dias}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Responsável</label>
            <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
          </div>

          <div className="modal-section">
            <h3>Fornecedor fixo (opcional)</h3>
            <div className="field">
              <label>Empresa</label>
              <input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} />
            </div>
            <div className="field">
              <label>WhatsApp do fornecedor</label>
              <input
                value={telefoneFornecedor}
                onChange={(e) => setTelefoneFornecedor(e.target.value)}
                placeholder="(62) 99999-9999"
              />
            </div>
            <div className="field">
              <label>Modelo de mensagem de confirmação (use {'{data}'} para a data real)</label>
              <textarea
                rows={3}
                value={mensagemModelo}
                onChange={(e) => setMensagemModelo(e.target.value)}
                placeholder={`Olá! Passando para confirmar a '${titulo || 'tarefa'}' agendada para {data} no Universo Park. Pode confirmar?`}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <div>
            {!isNew && (
              <button className="btn btn-danger btn-sm" onClick={handleExcluir} disabled={saving}>
                Excluir
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
