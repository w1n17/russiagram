'use client';

import { useEffect, useState } from 'react';
import { PostCard } from '@/entities/post';
import { getFeedPosts, toggleLike, toggleSave } from '@/entities/post/api';
import { Post } from '@/shared/types';
import { useUserStore } from '@/entities/user';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUserStore();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getFeedPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    try {
      const isLiked = await toggleLike(postId, currentUser.id);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: isLiked,
                likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (postId: string) => {
    if (!currentUser) return;

    try {
      const isSaved = await toggleSave(postId, currentUser.id);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, is_saved: isSaved } : post))
      );
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Нет постов для отображения</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop: Feed центрирован */}
      <div className="flex justify-center w-full pt-0 md:pt-8">
        {/* Feed */}
        <div className="w-full md:w-[470px] lg:w-[614px]">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onSave={() => handleSave(post.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
