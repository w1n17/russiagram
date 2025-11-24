import { supabase } from '@/shared/lib/supabase/client';
import { Post } from '@/shared/types';
import { createNotification } from '@/entities/notification/api';

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

  return data.map((post: any) => ({
    ...post,
    is_liked: post.likes?.some((like: any) => like.user_id === user?.id) || false,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.[0]?.count || 0,
  })) as Post[];
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

  return data.map((post: any) => ({
    ...post,
    is_liked: post.likes?.some((like: any) => like.user_id === user?.id) || false,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.[0]?.count || 0,
  })) as Post[];
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
    .insert(post as any)
    .select(`
      *,
      user:profiles(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, updates: { caption?: string; location?: string }): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    // @ts-ignore
    .update(updates)
    .eq('id', id)
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
    await supabase.from('likes').delete().eq('id', (existingLike as any).id);
    return false;
  } else {
    await supabase.from('likes').insert({ post_id: postId, user_id: userId } as any);

    try {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (!postError && post && (post as any).user_id !== userId) {
        await createNotification({
          userId: (post as any).user_id,
          actorId: userId,
          type: 'like',
          postId,
        });
      }
    } catch (error) {
      console.error('Error creating like notification:', error);
    }

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
    await supabase.from('saved_posts').delete().eq('id', (existingSave as any).id);
    return false;
  } else {
    await supabase.from('saved_posts').insert({ post_id: postId, user_id: userId } as any);
    return true;
  }
}

export async function getSavedPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('saved_posts')
    .select(`
      post_id,
      posts:post_id (
        *,
        user:profiles!posts_user_id_fkey(id, username, full_name, avatar_url, is_verified)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved posts:', error);
    return [];
  }

  const posts = (data || [])
    .map((item: any) => item.posts)
    .filter((post: any) => post !== null);

  const enrichedPosts = await Promise.all(
    posts.map(async (post: any) => {
      const [likesData, commentsCount] = await Promise.all([
        supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id)
      ]);

      return {
        ...post,
        is_liked: !!likesData.data,
        is_saved: true, 
        comments_count: commentsCount.count || 0,
      };
    })
  );

  return enrichedPosts as Post[];
}
