import { useEffect, useState } from 'react';
import { templateService } from '@/services/template.service';
import type { Template } from '@/types/database.types';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await templateService.list();
        if (!cancelled) setTemplates(data);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { templates, loading, error };
}
