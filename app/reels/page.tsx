"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/widgets/header/ui/header";
import { CreatePostModal } from "@/features/create-post/ui/create-post-modal";
import { getReelsFeed, toggleReelLike } from "@/entities/reel/api";
import { Reel } from "@/shared/types";
import { useUserStore } from "@/entities/user";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Avatar } from "@/shared/ui";
import { formatNumber } from "@/shared/lib/utils";
import Link from "next/link";

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const { currentUser } = useUserStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const data = await getReelsFeed();
      setReels(data);
    } catch (error) {
      console.error("Error loading reels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId: string) => {
    if (!currentUser) return (window.location.href = "/auth/login");

    try {
      const isLiked = await toggleReelLike(reelId, currentUser.id);
      setReels((prev) =>
        prev.map((reel) =>
          reel.id === reelId
            ? {
                ...reel,
                is_liked: isLiked,
                likes_count: reel.likes_count + (isLiked ? 1 : -1),
              }
            : reel
        )
      );
    } catch (error) {
      console.error("Error liking reel:", error);
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: 0.6 } 
    );

    const videos = document.querySelectorAll("video");
    videos.forEach((video) => observer.observe(video));

    return () => observer.disconnect();
  }, [reels]);

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main className="pt-[76px] bg-[#121212] h-screen w-full flex justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="w-full max-w-[400px] h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center text-white">
              Загрузка...
            </div>
          ) : reels.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white">
              Нет рилсов
            </div>
          ) : (
            reels.map((reel) => (
              <div
                key={reel.id}
                className="relative w-full h-[calc(100vh-60px)] md:h-[calc(100vh-76px)] snap-start bg-black flex items-center justify-center"
              >
                <video
                  src={reel.video_url}
                  className="w-full h-full object-cover"
                  loop
                  muted={muted}
                  playsInline
                  onClick={handleVideoClick}
                />

                <button
                  onClick={() => setMuted(!muted)}
                  className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors"
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent pt-20">
                  <div className="flex items-end justify-between">
                    <div className="flex-1 mr-12 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <Link
                          href={`/${reel.user?.username}`}
                          className="flex items-center gap-3"
                        >
                          <Avatar
                            src={reel.user?.avatar_url}
                            alt={reel.user?.username || "User"}
                            size="sm"
                            className="border border-white/20"
                          />
                          <span className="font-semibold text-sm drop-shadow-md">
                            {reel.user?.username}
                          </span>
                        </Link>
                        <button className="bg-transparent border border-white/50 rounded-lg px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                          Подписаться
                        </button>
                      </div>
                      <p className="text-sm mb-4 line-clamp-2 drop-shadow-md">
                        {reel.caption}
                      </p>
                      <div className="flex items-center gap-2 text-xs opacity-90">
                        <div className="flex items-center gap-1">
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-3 h-3"
                          >
                            <path d="M9 18V5l12 7-12 6Z" />
                          </svg>
                          <span>
                            {reel.audio_name || "Оригинальная аудиодорожка"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-6 pb-4">
                      <button
                        onClick={() => handleLike(reel.id)}
                        className="flex flex-col items-center gap-1"
                      >
                        <Heart
                          size={28}
                          className={
                            reel.is_liked
                              ? "fill-red-500 text-red-500"
                              : "text-white"
                          }
                          strokeWidth={1.5}
                        />
                        <span className="text-xs font-medium text-white">
                          {formatNumber(reel.likes_count)}
                        </span>
                      </button>

                      <button className="flex flex-col items-center gap-1">
                        <MessageCircle
                          size={28}
                          className="text-white"
                          strokeWidth={1.5}
                        />
                        <span className="text-xs font-medium text-white">
                          {formatNumber(reel.comments_count)}
                        </span>
                      </button>

                      <button className="flex flex-col items-center gap-1">
                        <Send
                          size={28}
                          className="text-white rotate-[-25deg] mb-1"
                          strokeWidth={1.5}
                        />
                      </button>

                      <button>
                        <MoreHorizontal
                          size={28}
                          className="text-white"
                          strokeWidth={1.5}
                        />
                      </button>

                      <div className="w-7 h-7 border border-white/50 rounded-lg overflow-hidden">
                        <img
                          src={reel.user?.avatar_url || "/default-avatar.png"}
                          alt="Music"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
