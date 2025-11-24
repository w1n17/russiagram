import { supabase } from '@/shared/lib/supabase/client';
import type { Story, Profile } from '@/shared/types';

export async function getStoriesFeed(currentUserId?: string | null): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      user:profiles!stories_user_id_fkey(id, username, full_name, avatar_url)
    `)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error loading stories:', error);
    return [];
  }

  const rows = data as any[];

  let viewedIds = new Set<string>();

  if (currentUserId) {
    const storyIds = rows.map((s) => s.id as string);

    if (storyIds.length > 0) {
      const { data: views, error: viewsError } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('user_id', currentUserId)
        .in('story_id', storyIds);

      if (viewsError) {
        console.error('Error loading story views:', viewsError);
      } else if (views) {
        viewedIds = new Set((views as any[]).map((v) => v.story_id as string));
      }
    }
  }

  return rows.map((row) => {
    const story = row as any as Story;
    const user = (row as any).user as Profile | undefined;
    return {
      ...story,
      user,
      is_viewed: viewedIds.has(story.id),
    } as Story;
  });
}

export async function createStory(params: {
  file: File;
  userId: string;
  mediaType: 'image' | 'video';
  duration?: number; 
}): Promise<Story | null> {
  try {
    const ext = params.file.name.split('.').pop() || 'jpg';
    const fileName = `${params.userId}/${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('stories')
      .upload(fileName, params.file);

    if (uploadError || !uploadData) {
      console.error('Error uploading story file:', uploadError);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('stories')
      .getPublicUrl(uploadData.path);

    const mediaUrl = publicUrlData.publicUrl as string;

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: params.userId,
        media_url: mediaUrl,
        media_type: params.mediaType,
        duration: params.duration ?? 5,
      } as any)
      .select(`
        *,
        user:profiles!stories_user_id_fkey(id, username, full_name, avatar_url)
      `)
      .single();

    if (error || !data) {
      console.error('Error creating story:', error);
      return null;
    }

    return data as any as Story;
  } catch (error) {
    console.error('Unexpected error creating story:', error);
    return null;
  }
}

export async function markStoryViewed(storyId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('story_views')
      .upsert(
        { story_id: storyId, user_id: userId } as any,
        { onConflict: 'story_id,user_id' }
      );

    if (error) {
      console.error('Error marking story as viewed:', error);
    }
  } catch (error) {
    console.error('Unexpected error marking story as viewed:', error);
  }
}

export async function deleteStory(storyId: string): Promise<void> {
  const { error } = await supabase.from('stories').delete().eq('id', storyId);
  if (error) throw error;
}
