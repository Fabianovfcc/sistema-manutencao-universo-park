export type Categoria =
  | 'Elétrica'
  | 'Hidráulica'
  | 'Brinquedos'
  | 'Estrutura/Galpão'
  | 'Desentupimento'
  | 'Outro';

export const CATEGORIAS: Categoria[] = [
  'Elétrica',
  'Hidráulica',
  'Brinquedos',
  'Estrutura/Galpão',
  'Desentupimento',
  'Outro',
];

export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta', 'Urgente'];

export type Status = 'solicitacao' | 'afazer' | 'andamento' | 'aguardando' | 'resolvido';

export const STATUS_LABEL: Record<Status, string> = {
  solicitacao: 'Solicitação',
  afazer: 'A Fazer',
  andamento: 'Em Andamento',
  aguardando: 'Aguardando Peça',
  resolvido: 'Resolvido',
};

export const COLUNAS: { status: Status; label: string; color: string }[] = [
  { status: 'solicitacao', label: 'Solicitações', color: 'var(--purple)' },
  { status: 'afazer', label: 'A Fazer', color: 'var(--orange)' },
  { status: 'andamento', label: 'Em Andamento', color: 'var(--blue)' },
  { status: 'aguardando', label: 'Aguardando Peça', color: 'var(--amber)' },
  { status: 'resolvido', label: 'Resolvido', color: 'var(--green)' },
];

export interface OS {
  id: string;
  numero: number;
  titulo: string;
  categoria: Categoria;
  prioridade: Prioridade;
  descricao: string | null;
  status: Status;
  solicitante: string | null;
  socio_responsavel: string | null;
  empresa_executante: string | null;
  responsavel_contato: string | null;
  preco: number;
  data_abertura: string;
  data_prevista: string | null;
  data_resolucao: string | null;
  created_at: string;
  updated_at: string;
}

export interface Orcamento {
  id: string;
  os_id: string;
  empresa: string | null;
  contato: string | null;
  valor: number | null;
  aprovado: boolean;
  created_at: string;
}

export type AnexoTipo = 'foto' | 'nota_fiscal';

export interface Anexo {
  id: string;
  os_id: string;
  tipo: AnexoTipo;
  storage_path: string;
  created_at: string;
}

export interface LogEntry {
  id: string;
  os_id: string;
  autor: string | null;
  texto: string;
  created_at: string;
}

export interface Rotina {
  id: string;
  titulo: string;
  freq_dias: number;
  responsavel: string | null;
  fornecedor: string | null;
  telefone_fornecedor: string | null;
  mensagem_modelo: string | null;
  ultima_execucao: string | null;
  created_at: string;
}

export const FREQUENCIAS: { label: string; dias: number }[] = [
  { label: 'Diária', dias: 1 },
  { label: 'Semanal', dias: 7 },
  { label: 'Quinzenal', dias: 15 },
  { label: 'Mensal', dias: 30 },
  { label: 'Trimestral', dias: 90 },
  { label: 'Semestral', dias: 180 },
];
