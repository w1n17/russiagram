"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PostCard } from "@/entities/post";
import { getFeedPosts, toggleLike, toggleSave } from "@/entities/post/api";
import { Post } from "@/shared/types";
import { useUserStore } from "@/entities/user";
import { StoriesBar } from "@/widgets/stories/ui/stories-bar";

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loader = useRef(null);
  const { currentUser } = useUserStore();

  const loadPosts = useCallback(async () => {
    if (!hasMore) return;

    try {
      const data = await getFeedPosts(5, page * 5); 
      if (data.length === 0) {
        setHasMore(false);
      } else {

        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUniquePosts = data.filter((p) => !existingIds.has(p.id));

          if (newUniquePosts.length === 0) {

            if (data.length < 5) setHasMore(false);
            return prev;
          }

          return [...prev, ...newUniquePosts];
        });

        if (data.length < 5) {
          setHasMore(false);
        } else {
          setPage((p) => p + 1);
        }
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, posts]);

  useEffect(() => {
    loadPosts();

  }, []); 


  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);

    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [handleObserver]);

  function handleObserver(entities: any) {
    const target = entities[0];
    if (target.isIntersecting && !loading && hasMore) {
      loadPosts();
    }
  }

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
                likes_count: isLiked
                  ? post.likes_count + 1
                  : post.likes_count - 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSave = async (postId: string) => {
    if (!currentUser) return;

    try {
      const isSaved = await toggleSave(postId, currentUser.id);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, is_saved: isSaved } : post
        )
      );
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-[470px] lg:max-w-[614px]">
          <StoriesBar />

          <div className="h-3 md:h-6 bg-[#fafafa] w-full" />

          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Нет постов для отображения</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {posts.map((post, index) => (
                <div key={post.id}>
                  <PostCard
                    post={post}
                    onLike={() => handleLike(post.id)}
                    onSave={() => handleSave(post.id)}
                  />
                  {index < posts.length - 1 && (
                    <div className="h-3 md:h-6 bg-[#fafafa] w-full" />
                  )}
                </div>
              ))}
              <div
                ref={loader}
                className="h-10 flex items-center justify-center py-4"
              >
                {hasMore && posts.length > 0 && (
                  <div className="text-gray-400 text-sm">Загрузка...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
