import { supabase } from '@/shared/lib/supabase/client';
import { Notification, Profile } from '@/shared/types';

export type NotificationWithActor = Notification;

export async function getUserNotifications(userId: string): Promise<NotificationWithActor[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, actor_id, type, post_id, reel_id, comment_id, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error loading notifications:', error);
    return [];
  }

  const rows = (data ?? []) as any[];

  const actorIds = Array.from(
    new Set(
      rows
        .map((n) => n.actor_id as string | null)
        .filter((id): id is string => !!id)
    )
  );

  let actorsById: Record<string, Profile> = {};

  if (actorIds.length > 0) {
    const { data: actors, error: actorsError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', actorIds);

    if (actorsError) {
      console.error('Error loading notification actors:', actorsError);
    } else if (actors) {
      const rows = actors as any[];
      actorsById = Object.fromEntries(rows.map((a) => [a.id as string, a as Profile]));
    }
  }

  return rows.map((n) => ({
    ...(n as Notification),
    actor: (n as any).actor_id ? actorsById[(n as any).actor_id as string] : undefined,
  })) as NotificationWithActor[];
}

export async function createNotification(params: {
  userId: string;
  actorId: string | null;
  type: Notification['type'];
  postId?: string | null;
  reelId?: string | null;
  commentId?: string | null;
}): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      actor_id: params.actorId,
      type: params.type,
      post_id: params.postId ?? null,
      reel_id: params.reelId ?? null,
      comment_id: params.commentId ?? null,
    } as any);

    if (error) {
      console.error('Error creating notification:', error);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
