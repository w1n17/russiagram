import { supabase } from '@/shared/lib/supabase/client';
import { Comment } from '@/shared/types';

export async function getPostComments(postId: string): Promise<Comment[]> {
  const { data } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('post_id', postId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function createComment(comment: {
  user_id: string;
  post_id?: string;
  reel_id?: string;
  parent_comment_id?: string;
  content: string;
}): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select(`
      *,
      user:profiles(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
}
