'use client';

import { useState, useEffect } from 'react';
import { Modal, Avatar, Button, Textarea } from '@/shared/ui';
import { useUserStore } from '@/entities/user';
import { MessageCircle, Heart, Send, X } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postImageUrl: string;
}

export function CommentsModal({ isOpen, onClose, postId, postImageUrl }: CommentsModalProps) {
  const { currentUser } = useUserStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(id, username, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          text: newComment.trim(),
        } as any)
        .select(`
          *,
          user:profiles(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex h-[500px] bg-white">
        {/* Изображение слева */}
        <div className="w-[55%] bg-black flex items-center justify-center">
          <img
            src={postImageUrl}
            alt="Post"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Комментарии справа */}
        <div className="w-[45%] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#dbdbdb]">
            <div className="flex items-center gap-3">
              <MessageCircle size={24} />
              <span className="font-semibold text-base">Комментарии</span>
            </div>
            <button onClick={onClose} className="hover:opacity-60">
              <X size={24} />
            </button>
          </div>

          {/* Список комментариев */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">Пока нет комментариев</p>
                <p className="text-gray-400 text-xs mt-1">Станьте первым!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar
                    src={comment.user.avatar_url}
                    alt={comment.user.username}
                    size="sm"
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-[#8e8e8e]">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-[#262626] mt-1">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Форма добавления комментария */}
          <form onSubmit={handleSubmit} className="border-t border-[#dbdbdb] p-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={currentUser?.avatar_url}
                alt={currentUser?.username || ''}
                size="sm"
              />
              <input
                type="text"
                placeholder="Добавьте комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-sm outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || loading}
                className="text-[#0095f6] font-semibold text-sm disabled:opacity-30"
              >
                {loading ? 'Отправка...' : 'Опубликовать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
