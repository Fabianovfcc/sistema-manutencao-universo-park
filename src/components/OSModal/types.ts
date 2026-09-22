export interface UIOrcamento {
  id: string;
  empresa: string;
  contato: string;
  valor: number;
  aprovado: boolean;
}

export interface UIAnexo {
  id: string;
  tipo: 'foto' | 'nota_fiscal';
  url: string;
  isPdf: boolean;
  file?: File;
  storagePath?: string;
  originalName?: string;
}

export interface UILogEntry {
  id: string;
  autor: string;
  texto: string;
  createdAt: string;
}
