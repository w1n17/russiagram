'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/shared/ui';
import { Post } from '@/shared/types';
import { ROUTES } from '@/shared/lib/constants';
import { formatTimeAgo, formatNumber } from '@/shared/lib/utils';
import { CommentsModal } from '@/features/comments/ui/comments-modal';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

export function PostCard({ post, onLike, onComment, onShare, onSave }: PostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isCarousel = post.media_type === 'carousel' && post.media_urls.length > 1;

  return (
    <article className="bg-white border border-[#dbdbdb] rounded-sm overflow-hidden mb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3.5 md:px-4 md:py-3">
        <Link href={ROUTES.PROFILE(post.user?.username || '')} className="flex items-center gap-3">
          <Avatar src={post.user?.avatar_url} alt={post.user?.username || ''} size="sm" className="w-8 h-8" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[14px]">{post.user?.username}</span>
              {post.user?.is_verified && (
                <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              )}
              {post.location && (
                <>
                  <span className="text-[#262626]">•</span>
                  <span className="text-xs text-[#8e8e8e]">{post.location}</span>
                </>
              )}
            </div>
          </div>
        </Link>
        <button className="p-2 hover:opacity-60 transition-opacity">
          <MoreHorizontal size={24} strokeWidth={2} />
        </button>
      </div>

      {/* Media */}
      <div className="relative aspect-square bg-black">
        {post.media_type === 'video' ? (
          <video
            src={post.media_urls[0]}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <Image
            src={post.media_urls[currentImageIndex]}
            alt="Post media"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        )}
        
        {isCarousel && (
          <>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {post.media_urls.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
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
            {currentImageIndex < post.media_urls.length - 1 && (
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

      {/* Actions */}
      <div className="px-3 md:px-4">
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-4">
            <button
              className="hover:opacity-60 transition-opacity"
              onClick={onLike}
            >
              <Heart
                size={24}
                strokeWidth={1.5}
                fill={post.is_liked ? 'currentColor' : 'none'}
                className={post.is_liked ? 'text-red-500' : ''}
              />
            </button>
            <button 
              className="hover:opacity-60 transition-opacity"
              onClick={() => setIsCommentsOpen(true)}
            >
              <MessageCircle size={24} strokeWidth={1.5} />
            </button>
            <button onClick={onShare} className="hover:opacity-60 transition-opacity">
              <Send size={24} strokeWidth={1.5} />
            </button>
          </div>
          <button onClick={onSave} className="hover:opacity-60 transition-opacity">
            <Bookmark size={24} strokeWidth={1.5} className={post.is_saved ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="pb-3">
          {post.likes_count > 0 && (
            <p className="font-semibold text-[14px] mb-2">{formatNumber(post.likes_count)} отметок "Нравится"</p>
          )}

          {post.caption && (
            <p className="text-[14px] mb-1.5 leading-[18px]">
              <Link href={ROUTES.PROFILE(post.user?.username || '')} className="font-semibold mr-1">
                {post.user?.username}
              </Link>
              <span className="whitespace-pre-wrap">{post.caption}</span>
            </p>
          )}

          {post.comments_count > 0 && (
            <button 
              onClick={() => setIsCommentsOpen(true)}
              className="text-[14px] text-[#8e8e8e] mb-2 hover:opacity-60"
            >
              Посмотреть все комментарии ({post.comments_count})
            </button>
          )}

          <p className="text-[10px] text-[#8e8e8e] uppercase tracking-[0.2px]">{formatTimeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Модалка комментариев */}
      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        postId={post.id}
        postImageUrl={post.media_urls[0]}
      />
    </article>
  );
}
