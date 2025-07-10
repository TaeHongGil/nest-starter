import { useMemo } from 'react';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export function useRouter() {
  const navigate = useNavigate();

  const router = useMemo(
    () => ({
      back: async () => navigate(-1),
      forward: async () => navigate(1),
      refresh: async () => navigate(0),
      push: async (href: string) => navigate(href),
      replace: async (href: string) => navigate(href, { replace: true }),
    }),
    [navigate],
  );

  return router;
}
