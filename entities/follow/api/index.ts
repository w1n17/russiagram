import { supabase } from '@/shared/lib/supabase/client';
import { Profile } from '@/shared/types';
import { createNotification } from '@/entities/notification/api';

export async function getFollowersByUserId(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('follower:profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)')
    .eq('following_id', userId);

  if (error || !data) {
    console.error('Error loading followers:', error);
    return [];
  }

  return (data as any[])
    .map((row) => row.follower as Profile)
    .filter(Boolean);
}

export async function getFollowingByUserId(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('following:profiles!follows_following_id_fkey(id, username, full_name, avatar_url)')
    .eq('follower_id', userId);

  if (error || !data) {
    console.error('Error loading following:', error);
    return [];
  }

  return (data as any[])
    .map((row) => row.following as Profile)
    .filter(Boolean);
}

export async function checkIsFollowing(targetUserId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (error) {
    console.error('Error checking isFollowing:', error);
    return false;
  }

  return !!data;
}

export async function toggleFollow(targetUserId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing, error: existingError } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existingError) {
    console.error('Error checking follow:', existingError);
  }

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', (existing as any).id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetUserId } as any);
  if (error) throw error;

  await createNotification({
    userId: targetUserId,
    actorId: user.id,
    type: 'follow',
  });
  return true;
}
