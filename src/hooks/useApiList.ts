import { useCallback, useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

type ListState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: T[] };

// Loads a list from the API with loading/error states; reload() refetches after a change.
export function useApiList<T>(fetcher: () => Promise<AxiosResponse<T[]>>) {
  const [state, setState] = useState<ListState<T>>({ status: 'loading' });
  const load = useCallback(() => fetcher().then(
    response => setState({ status: 'ready', items: Array.isArray(response.data) ? response.data : [] }),
    () => setState({ status: 'error' }),
  ), [fetcher]);
  const reload = useCallback(async () => { setState({ status: 'loading' }); await load(); }, [load]);
  useEffect(() => { void load(); }, [load]);
  return { state, reload };
}
