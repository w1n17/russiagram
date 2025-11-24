import { supabase } from '@/shared/lib/supabase/client';
import { Conversation, Message } from '@/shared/types';
import { createNotification } from '@/entities/notification/api';

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const { data: participantRows } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);

  if (!participantRows || participantRows.length === 0) return [];
  
  const conversationIds = participantRows.map((r: any) => r.conversation_id);

  const { data } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(
        user:profiles(*)
      ),
      messages(
        content,
        created_at,
        sender:profiles(username)
      )
    `)
    .in('id', conversationIds)
    .order('updated_at', { ascending: false });

  if (!data) return [];

  return data.map((conv: any) => {
    const participants = conv.participants.map((p: any) => p.user);
    const otherUser = participants.find((p: any) => p.id !== userId) || participants[0];
    
    
    const sortedMessages = (conv.messages || []).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMessage = sortedMessages[0];

    return {
      ...conv,
      name: conv.name || otherUser?.username || 'Диалог',
      avatar_url: conv.avatar_url || otherUser?.avatar_url,
      participants,
      last_message: lastMessage
    };
  });
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return data || [];
}

export async function sendMessage(message: {
  conversation_id: string;
  sender_id: string;
  content?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio' | 'post' | 'reel';
  post_id?: string;
  reel_id?: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message as any)
    .select(`
      *,
      sender:profiles(*)
    `)
    .single();

  if (error) throw error;

  try {
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', message.conversation_id)
      .neq('user_id', message.sender_id);

    if (!participantsError && participants) {
      await Promise.all(
        (participants as any[]).map((p) =>
          createNotification({
            userId: p.user_id as string,
            actorId: message.sender_id,
            type: 'message',
          })
        )
      );
    }
  } catch (e) {
    console.error('Error creating message notifications:', e);
  }

  return data;
}

export async function createConversation(participants: string[]): Promise<Conversation> {
  if (participants.length === 2) {
    const { data: existingConvs } = await supabase.rpc('find_conversation_by_participants', {
      user_ids: participants
    } as any);
    
    if (existingConvs && (existingConvs as any[]).length > 0) {
      return { id: (existingConvs as any[])[0].conversation_id } as any;
    }
  }
  
  const { data: newConvId, error: createError } = await supabase.rpc('create_new_conversation', {
    user_ids: participants
  } as any);

  if (createError) throw createError;

  return { id: newConvId } as any;
}

export async function getOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
  return createConversation([userId1, userId2]);
}
