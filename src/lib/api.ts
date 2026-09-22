import { supabase, ANEXOS_BUCKET } from './supabase';
import type {
  OS,
  Orcamento,
  Anexo,
  LogEntry,
  Rotina,
  AnexoTipo,
  ChecklistItem,
  ChecklistDiario,
  ChecklistResposta,
  ChecklistStatus,
} from '../types';

// ---------- O.S. ----------

export async function fetchOS(): Promise<OS[]> {
  const { data, error } = await supabase
    .from('manutencao_os')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as OS[];
}

export type NovaOS = Omit<
  OS,
  'id' | 'numero' | 'created_at' | 'updated_at' | 'data_resolucao'
>;

export async function createOS(payload: NovaOS): Promise<OS> {
  const { data, error } = await supabase
    .from('manutencao_os')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as OS;
}

export async function updateOS(id: string, patch: Partial<OS>): Promise<OS> {
  const { data, error } = await supabase
    .from('manutencao_os')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as OS;
}

export async function deleteOS(id: string): Promise<void> {
  const { error } = await supabase.from('manutencao_os').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Orçamentos ----------

export async function fetchOrcamentos(osId: string): Promise<Orcamento[]> {
  const { data, error } = await supabase
    .from('manutencao_orcamentos')
    .select('*')
    .eq('os_id', osId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Orcamento[];
}

export async function addOrcamento(
  osId: string,
  payload: Omit<Orcamento, 'id' | 'os_id' | 'created_at' | 'aprovado'>
): Promise<Orcamento> {
  const { data, error } = await supabase
    .from('manutencao_orcamentos')
    .insert({ ...payload, os_id: osId })
    .select()
    .single();
  if (error) throw error;
  return data as Orcamento;
}

export async function updateOrcamentoFields(
  id: string,
  patch: Partial<Pick<Orcamento, 'empresa' | 'contato' | 'valor'>>
): Promise<void> {
  const { error } = await supabase.from('manutencao_orcamentos').update(patch).eq('id', id);
  if (error) throw error;
}

export async function setOrcamentoAprovado(
  osId: string,
  orcamentoId: string
): Promise<void> {
  const { error: clearErr } = await supabase
    .from('manutencao_orcamentos')
    .update({ aprovado: false })
    .eq('os_id', osId);
  if (clearErr) throw clearErr;
  const { error } = await supabase
    .from('manutencao_orcamentos')
    .update({ aprovado: true })
    .eq('id', orcamentoId);
  if (error) throw error;
}

export async function deleteOrcamento(id: string): Promise<void> {
  const { error } = await supabase.from('manutencao_orcamentos').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Anexos ----------

export async function fetchAllAnexosMeta(): Promise<Pick<Anexo, 'os_id' | 'tipo'>[]> {
  const { data, error } = await supabase.from('manutencao_anexos').select('os_id, tipo');
  if (error) throw error;
  return data as Pick<Anexo, 'os_id' | 'tipo'>[];
}

export async function fetchAnexos(osId: string): Promise<Anexo[]> {
  const { data, error } = await supabase
    .from('manutencao_anexos')
    .select('*')
    .eq('os_id', osId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Anexo[];
}

export async function uploadAnexo(
  osId: string,
  tipo: AnexoTipo,
  file: Blob,
  ext: string,
  nomeOriginal?: string
): Promise<Anexo> {
  const path = `${osId}/${tipo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage.from(ANEXOS_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from('manutencao_anexos')
    .insert({ os_id: osId, tipo, storage_path: path, nome_original: nomeOriginal ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as Anexo;
}

export function anexoPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(ANEXOS_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function anexoSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(ANEXOS_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteAnexo(anexo: Anexo): Promise<void> {
  await supabase.storage.from(ANEXOS_BUCKET).remove([anexo.storage_path]);
  const { error } = await supabase.from('manutencao_anexos').delete().eq('id', anexo.id);
  if (error) throw error;
}

// ---------- Histórico / Log ----------

export async function fetchLog(osId: string): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('manutencao_log')
    .select('*')
    .eq('os_id', osId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as LogEntry[];
}

export async function addLogEntry(
  osId: string,
  autor: string,
  texto: string
): Promise<LogEntry> {
  const { data, error } = await supabase
    .from('manutencao_log')
    .insert({ os_id: osId, autor, texto })
    .select()
    .single();
  if (error) throw error;
  return data as LogEntry;
}

// ---------- Rotinas ----------

export async function fetchRotinas(): Promise<Rotina[]> {
  const { data, error } = await supabase
    .from('manutencao_rotinas')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Rotina[];
}

export type NovaRotina = Omit<Rotina, 'id' | 'created_at'>;

export async function createRotina(payload: NovaRotina): Promise<Rotina> {
  const { data, error } = await supabase
    .from('manutencao_rotinas')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Rotina;
}

export async function updateRotina(id: string, patch: Partial<Rotina>): Promise<Rotina> {
  const { data, error } = await supabase
    .from('manutencao_rotinas')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Rotina;
}

export async function deleteRotina(id: string): Promise<void> {
  const { error } = await supabase.from('manutencao_rotinas').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Checklist diário de abertura ----------

export async function fetchChecklistItens(somenteAtivos = true): Promise<ChecklistItem[]> {
  let query = supabase.from('manutencao_checklist_itens').select('*').order('ordem', { ascending: true });
  if (somenteAtivos) query = query.eq('ativo', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as ChecklistItem[];
}

export async function createChecklistItem(titulo: string, ordem: number): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from('manutencao_checklist_itens')
    .insert({ titulo, ordem })
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistItem;
}

export async function updateChecklistItem(
  id: string,
  patch: Partial<Pick<ChecklistItem, 'titulo' | 'ativo' | 'ordem'>>
): Promise<void> {
  const { error } = await supabase.from('manutencao_checklist_itens').update(patch).eq('id', id);
  if (error) throw error;
}

export async function fetchChecklistDiarios(): Promise<ChecklistDiario[]> {
  const { data, error } = await supabase
    .from('manutencao_checklist_diario')
    .select('*')
    .order('data', { ascending: false });
  if (error) throw error;
  return data as ChecklistDiario[];
}

export async function getOrCreateChecklistHoje(data: string): Promise<ChecklistDiario> {
  const { error: upsertErr } = await supabase
    .from('manutencao_checklist_diario')
    .upsert({ data }, { onConflict: 'data', ignoreDuplicates: true });
  if (upsertErr) throw upsertErr;

  const { data: row, error } = await supabase
    .from('manutencao_checklist_diario')
    .select('*')
    .eq('data', data)
    .single();
  if (error) throw error;
  return row as ChecklistDiario;
}

export async function setChecklistFeitoPor(diarioId: string, feitoPor: string): Promise<void> {
  const { error } = await supabase
    .from('manutencao_checklist_diario')
    .update({ feito_por: feitoPor })
    .eq('id', diarioId);
  if (error) throw error;
}

export async function fetchAllChecklistRespostas(): Promise<ChecklistResposta[]> {
  const { data, error } = await supabase.from('manutencao_checklist_respostas').select('*');
  if (error) throw error;
  return data as ChecklistResposta[];
}

export async function upsertChecklistResposta(
  diarioId: string,
  itemId: string,
  status: ChecklistStatus,
  descricaoProblema: string | null
): Promise<ChecklistResposta> {
  const { data, error } = await supabase
    .from('manutencao_checklist_respostas')
    .upsert(
      {
        checklist_diario_id: diarioId,
        checklist_item_id: itemId,
        status,
        descricao_problema: descricaoProblema,
        respondido_em: new Date().toISOString(),
      },
      { onConflict: 'checklist_diario_id,checklist_item_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as ChecklistResposta;
}
