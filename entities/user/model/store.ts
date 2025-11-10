import { create } from 'zustand';
import { Profile } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase/client';

interface UserState {
  currentUser: Profile | null;
  loading: boolean;
  setCurrentUser: (user: Profile | null) => void;
  loadCurrentUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  loading: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  loadCurrentUser: async () => {
    try {
      set({ loading: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Изменено с .single() на .maybeSingle() - не вызывает ошибку если нет записи
        
        if (error) {
          console.error('Error loading profile:', error);
        }
        
        // Если профиля нет - создаем его вручную как fallback
        if (!profile && user) {
          console.log('Profile not found, creating...');
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              full_name: user.user_metadata?.full_name || '',
            })
            .select()
            .single();
          
          set({ currentUser: newProfile, loading: false });
        } else {
          set({ currentUser: profile, loading: false });
        }
      } else {
        set({ currentUser: null, loading: false });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ currentUser: null, loading: false });
    }
  },
}));
