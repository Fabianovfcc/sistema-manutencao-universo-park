import { useCallback, useEffect, useState } from 'react';
import {
  fetchChecklistItens,
  fetchChecklistDiarios,
  fetchAllChecklistRespostas,
} from '../lib/api';
import type { ChecklistItem, ChecklistDiario, ChecklistResposta } from '../types';

export interface ChecklistData {
  itens: ChecklistItem[];
  diarios: ChecklistDiario[];
  respostas: ChecklistResposta[];
  loading: boolean;
  reload: () => Promise<void>;
}

export function useChecklistData(): ChecklistData {
  const [itens, setItens] = useState<ChecklistItem[]>([]);
  const [diarios, setDiarios] = useState<ChecklistDiario[]>([]);
  const [respostas, setRespostas] = useState<ChecklistResposta[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [i, d, r] = await Promise.all([
        fetchChecklistItens(false),
        fetchChecklistDiarios(),
        fetchAllChecklistRespostas(),
      ]);
      setItens(i);
      setDiarios(d);
      setRespostas(r);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { itens, diarios, respostas, loading, reload };
}
