import { useCallback, useEffect, useState } from 'react';
import { fetchOS } from '../lib/api';
import type { OS } from '../types';

export function useOS() {
  const [osList, setOsList] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOS();
      setOsList(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar O.S.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { osList, loading, error, reload };
}
