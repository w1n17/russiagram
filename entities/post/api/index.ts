import { supabase } from '@/shared/lib/supabase/client';
import { Post } from '@/shared/types';

export async function getFeedPosts(limit = 20, offset = 0): Promise<Post[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles(*),
      likes(user_id),
      comments(count)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!data) return [];

  // Маппинг с is_liked и счётчиками
  return data.map(post => ({
    ...post,
    is_liked: post.likes?.some((like: any) => like.user_id === user?.id) || false,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.[0]?.count || 0,
  }));
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('id', id)
    .single();

  return data;
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles(*),
      likes(user_id),
      comments(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!data) return [];

  return data.map(post => ({
    ...post,
    is_liked: post.likes?.some((like: any) => like.user_id === user?.id) || false,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.[0]?.count || 0,
  }));
}

export async function createPost(post: {
  user_id: string;
  caption?: string;
  media_urls: string[];
  media_type: 'image' | 'video' | 'carousel';
  location?: string;
}): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select(`
      *,
      user:profiles(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existingLike) {
    await supabase.from('likes').delete().eq('id', existingLike.id);
    return false;
  } else {
    await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    return true;
  }
}

export async function toggleSave(postId: string, userId: string): Promise<boolean> {
  const { data: existingSave } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existingSave) {
    await supabase.from('saved_posts').delete().eq('id', existingSave.id);
    return false;
  } else {
    await supabase.from('saved_posts').insert({ post_id: postId, user_id: userId });
    return true;
  }
}
