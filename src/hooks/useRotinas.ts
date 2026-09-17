import { useCallback, useEffect, useState } from 'react';
import { fetchRotinas } from '../lib/api';
import type { Rotina } from '../types';

export function useRotinas() {
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRotinas();
      setRotinas(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar rotinas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rotinas, loading, error, reload };
}
