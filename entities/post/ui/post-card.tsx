"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  X,
  Check,
} from "lucide-react";
import { Avatar } from "@/shared/ui";
import { useUserStore } from "@/entities/user";
import { Post } from "@/shared/types";
import { deletePost, updatePost } from "@/entities/post/api";
import { ROUTES } from "@/shared/lib/constants";
import { formatTimeAgo, formatNumber } from "@/shared/lib/utils";
import { CommentsModal } from "@/features/comments/ui/comments-modal";
import { EditPostModal } from "@/features/create-post/ui/edit-post-modal";

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  className?: string;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  className,
}: PostCardProps) {
  const { currentUser } = useUserStore();
  const [postData, setPostData] = useState(post);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isCarousel =
    postData.media_type === "carousel" && postData.media_urls.length > 1;

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот пост?")) return;
    try {
      await deletePost(postData.id);
      setIsDeleted(true);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Не удалось удалить пост");
    }
  };

  if (isDeleted) return null;

  return (
    <article
      className={`bg-white border-t border-b md:border md:border-[#dbdbdb] md:rounded-sm overflow-hidden w-full border-[#dbdbdb] transition-all duration-200 hover:shadow-sm ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3.5 md:px-4 md:py-3">
        <Link
          href={ROUTES.PROFILE(post.user?.username || "")}
          className="flex items-center gap-3"
        >
          <Avatar
            src={postData.user?.avatar_url}
            alt={post.user?.username || ""}
            size="sm"
            className="w-8 h-8"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[14px]">
                {postData.user?.username}
              </span>
              {post.user?.is_verified && (
                <svg
                  className="w-3 h-3 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              )}
              {post.location && (
                <>
                  <span className="text-[#262626]">•</span>
                  <span className="text-xs text-[#8e8e8e]">
                    {postData.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:opacity-60 transition-opacity"
          >
            <MoreHorizontal size={24} strokeWidth={2} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                {currentUser?.id === post.user_id ? (
                  <>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-500 font-semibold"
                      onClick={handleDelete}
                    >
                      Удалить
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                      onClick={() => {
                        setIsEditModalOpen(true);
                        setShowMenu(false);
                      }}
                    >
                      Редактировать
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                  </>
                ) : (
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-500 font-semibold"
                    onClick={() =>
                      alert('Функционал "Пожаловаться" пока не реализован')
                    }
                  >
                    Пожаловаться
                  </button>
                )}
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/p/${post.id}`
                    )
                  }
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Копировать ссылку
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative aspect-square bg-black">
        {postData.media_type === "video" ? (
          <video
            src={postData.media_urls[0]}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <Image
            src={postData.media_urls[currentImageIndex]}
            alt="Post media"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        )}

        {isCarousel && (
          <>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {postData.media_urls.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            {currentImageIndex > 0 && (
              <button
                onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
              >
                ←
              </button>
            )}
            {currentImageIndex < postData.media_urls.length - 1 && (
              <button
                onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
              >
                →
              </button>
            )}
          </>
        )}
      </div>

      <div className="px-3 md:px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <button
              className="hover:opacity-60 transition-all active:scale-75"
              onClick={onLike}
            >
              <Heart
                size={24}
                strokeWidth={1.5}
                fill={post.is_liked ? "currentColor" : "none"}
                className={
                  postData.is_liked ? "text-red-500" : "transition-colors"
                }
              />
            </button>
            <button
              className="hover:opacity-60 transition-opacity"
              onClick={() => setIsCommentsOpen(true)}
            >
              <MessageCircle size={24} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => {
                if (onShare) {
                  onShare();
                } else {
                  const url = `${window.location.origin}/p/${post.id}`;
                  navigator.clipboard.writeText(url);
                  alert("Ссылка скопирована в буфер обмена!");
                }
              }}
              className="hover:opacity-60 transition-opacity"
            >
              <Send size={24} strokeWidth={1.5} />
            </button>
          </div>
          <button
            onClick={onSave}
            className="hover:opacity-60 transition-opacity"
          >
            <Bookmark
              size={24}
              strokeWidth={1.5}
              className={post.is_saved ? "fill-current" : ""}
            />
          </button>
        </div>

        <div className="pb-4">
          {postData.likes_count > 0 && (
            <p className="font-semibold text-[14px] mb-3">
              {formatNumber(postData.likes_count)} отметок "Нравится"
            </p>
          )}

          {postData.caption && (
            <p className="text-[14px] mb-3 leading-[18px]">
              <Link
                href={ROUTES.PROFILE(postData.user?.username || "")}
                className="font-semibold mr-1"
              >
                {postData.user?.username}
              </Link>
              <span className="whitespace-pre-wrap">{postData.caption}</span>
            </p>
          )}

          {postData.comments_count > 0 && (
            <button
              onClick={() => setIsCommentsOpen(true)}
              className="text-[14px] text-[#8e8e8e] mb-3 hover:opacity-60"
            >
              Посмотреть все комментарии ({postData.comments_count})
            </button>
          )}

          <p className="text-[10px] text-[#8e8e8e] uppercase tracking-[0.2px]">
            {formatTimeAgo(postData.created_at)}
          </p>
        </div>
      </div>

      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        postId={postData.id}
        postImageUrl={postData.media_urls[0]}
      />

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={postData}
        onUpdate={(updated) => setPostData({ ...postData, ...updated })}
      />
    </article>
  );
}
