"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Textarea, Input, Avatar } from "@/shared/ui";
import { updatePost } from "@/entities/post/api";
import { useUserStore } from "@/entities/user";
import { Post } from "@/shared/types";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onUpdate: (updatedPost: Post) => void;
}

export function EditPostModal({
  isOpen,
  onClose,
  post,
  onUpdate,
}: EditPostModalProps) {
  const { currentUser } = useUserStore();
  const [caption, setCaption] = useState(post.caption || "");
  const [location, setLocation] = useState(post.location || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCaption(post.caption || "");
      setLocation(post.location || "");
    }
  }, [isOpen, post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updatePost(post.id, { caption, location });
      onUpdate(updated);
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Не удалось обновить пост");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать публикацию"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex h-[540px]">
        <div className="w-[60%] bg-black flex items-center justify-center">
          {post.media_type === "video" ? (
            <video
              src={post.media_urls[0]}
              className="max-w-full max-h-full object-contain"
              controls
            />
          ) : (
            <img
              src={post.media_urls[0]}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        <div className="w-[40%] flex flex-col bg-white">
          <div className="flex items-center gap-3 p-4 border-b border-[#dbdbdb]">
            <Avatar
              src={currentUser?.avatar_url}
              alt={currentUser?.username || "User"}
              size="sm"
              className="w-8 h-8"
            />
            <span className="font-semibold text-sm">
              {currentUser?.username}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <Textarea
              placeholder="Добавьте подпись..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
              className="w-full h-[150px] resize-none border-0 focus:ring-0 text-sm p-0"
            />
            <div className="text-xs text-[#8e8e8e] text-right mt-1">
              {caption.length}/2200
            </div>
          </div>

          <div className="border-t border-[#dbdbdb] p-4">
            <Input
              placeholder="Добавить место"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-0 px-0"
            />
          </div>

          <div className="border-t border-[#dbdbdb] p-3">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Сохранение..." : "Готово"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
