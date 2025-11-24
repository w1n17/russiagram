import { supabase } from '@/shared/lib/supabase/client';
import { Reel } from '@/shared/types';

export async function getReelsFeed(limit = 10, offset = 0): Promise<Reel[]> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('reels')
    .select(`
      *,
      user:profiles(*),
      likes(user_id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    console.error('Error loading reels:', error);
    return [];
  }

  return data.map((reel: any) => ({
    ...reel,
    is_liked: reel.likes?.some((like: any) => like.user_id === user?.id) || false,
    likes_count: reel.likes_count || 0,
    comments_count: reel.comments_count || 0,
  })) as Reel[];
}

export async function toggleReelLike(reelId: string, userId: string): Promise<boolean> {
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('reel_id', reelId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingLike) {
    await supabase.from('likes').delete().eq('id', (existingLike as any).id);
    return false;
  } else {
    await supabase.from('likes').insert({ reel_id: reelId, user_id: userId } as any);
    return true;
  }
}
