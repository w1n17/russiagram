"use client";

import { useState, useEffect } from "react";
import { Modal, Avatar, Button, Textarea, Input } from "@/shared/ui";
import { useUserStore } from "@/entities/user";
import { MessageCircle, Heart, Send, X } from "lucide-react";
import { supabase } from "@/shared/lib/supabase/client";
import { createNotification } from "@/entities/notification/api";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
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

export function CommentsModal({
  isOpen,
  onClose,
  postId,
  postImageUrl,
}: CommentsModalProps) {
  const { currentUser } = useUserStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:profiles(id, username, full_name, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: newComment.trim(),
        } as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) return;

      const newCommentWithUser = {
        ...(data as any),
        user: {
          id: currentUser.id,
          username: currentUser.username,
          full_name: currentUser.full_name,
          avatar_url: currentUser.avatar_url,
        },
      };

      setComments([...comments, newCommentWithUser]);
      setNewComment("");

      try {
        const { data: post, error: postError } = await supabase
          .from("posts")
          .select("user_id")
          .eq("id", postId)
          .single();

        if (!postError && post && (post as any).user_id !== currentUser.id) {
          await createNotification({
            userId: (post as any).user_id,
            actorId: currentUser.id,
            type: "comment",
            postId,
            commentId: (data as any).id,
          });
        }
      } catch (notifyError) {
        console.error("Error creating comment notification:", notifyError);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col md:flex-row h-[80vh] bg-white rounded-xl overflow-hidden w-full max-w-[900px]">
        <div className="hidden md:flex md:w-[55%] lg:w-[60%] bg-black items-center justify-center relative">
          <img
            src={postImageUrl}
            alt="Post"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col bg-white h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#efefef]">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-base">Комментарии</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">Пока нет комментариев</p>
                <p className="text-gray-400 text-xs mt-1">Станьте первым!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar
                    src={comment.user.avatar_url}
                    alt={comment.user.username}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <div className="inline-block">
                      <span className="font-semibold text-sm mr-2">
                        {comment.user.username}
                      </span>
                      <span className="text-sm text-[#262626]">
                        {comment.content}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#8e8e8e]">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: false,
                          locale: ru,
                        })}
                      </span>
                      <button className="text-xs text-[#8e8e8e] font-semibold">
                        Ответить
                      </button>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart
                      size={12}
                      className="text-[#8e8e8e] hover:text-[#8e8e8e]/50"
                    />
                  </button>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-[#efefef] px-4 py-3 bg-white shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Добавьте комментарий..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={loading}
                  className="bg-gray-100 border-transparent focus:bg-white focus:border-gray-300"
                />
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || loading}
                className="text-[#0095f6] font-semibold text-sm disabled:opacity-30 hover:text-[#00376b] transition-colors px-2"
              >
                {loading ? "..." : "Опубликовать"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
