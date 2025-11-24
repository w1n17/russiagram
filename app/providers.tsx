'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/entities/user';
import { supabase } from '@/shared/lib/supabase/client';

export function Providers({ children }: { children: React.ReactNode }) {
  const loadCurrentUser = useUserStore((state) => state.loadCurrentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  useEffect(() => {
    loadCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadCurrentUser();
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCurrentUser, setCurrentUser]);

  return <>{children}</>;
}
