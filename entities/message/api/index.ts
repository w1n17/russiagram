import { supabase } from '@/shared/lib/supabase/client';
import { Conversation, Message } from '@/shared/types';

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const { data } = await supabase
    .from('conversation_participants')
    .select(`
      conversation:conversations(*)
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  return data?.map((d: any) => d.conversation) || [];
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
    .insert(message)
    .select(`
      *,
      sender:profiles(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function createConversation(participants: string[]): Promise<Conversation> {
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (convError) throw convError;

  const participantRecords = participants.map((userId) => ({
    conversation_id: conversation.id,
    user_id: userId,
  }));

  await supabase.from('conversation_participants').insert(participantRecords);

  return conversation;
}
