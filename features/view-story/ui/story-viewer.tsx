"use client";

import { useEffect, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { markStoryViewed } from "@/entities/story/api";
import { Story, Profile } from "@/shared/types";
import { useUserStore } from "@/entities/user";

export interface UserStoriesGroup {
  user: Profile;
  stories: Story[];
}

interface StoryViewerProps {
  initialGroupIndex: number;
  groups: UserStoriesGroup[];
  onClose: () => void;
  onViewStory?: (storyId: string) => void;
  onDeleteStory?: (storyId: string) => Promise<void>;
}

export function StoryViewer({
  initialGroupIndex,
  groups,
  onClose,
  onViewStory,
  onDeleteStory,
}: StoryViewerProps) {
  const { currentUser } = useUserStore();
  const [activeUserIndex, setActiveUserIndex] = useState(initialGroupIndex);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const SafeUserIndex = Math.min(activeUserIndex, groups.length - 1);
  const currentGroup = groups[SafeUserIndex];
  const currentStory =
    currentGroup?.stories[
      Math.min(activeStoryIndex, currentGroup.stories.length - 1)
    ];

  useEffect(() => {
    if (!currentGroup || !currentStory) {
      onClose();
    }
  }, [currentGroup, currentStory, onClose]);

  useEffect(() => {
    if (!currentStory || isDeleting) return;

    if (currentStory.media_type !== "video") {
      const durationMs = (currentStory.duration || 5) * 1000;
      const timer = setTimeout(() => {
        handleNextStory();
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [activeUserIndex, activeStoryIndex, currentStory, isDeleting]);

  useEffect(() => {
    if (!currentStory || !currentUser) return;

    if (!currentStory.is_viewed) {
      markStoryViewed(currentStory.id, currentUser.id).catch(console.error);
      if (onViewStory) {
        onViewStory(currentStory.id);
      }
    }
  }, [currentStory?.id]);

  const handleNextStory = () => {
    if (!currentGroup) return;

    if (activeStoryIndex < currentGroup.stories.length - 1) {
      setActiveStoryIndex((i) => i + 1);
    } else if (activeUserIndex < groups.length - 1) {
      setActiveUserIndex((i) => i + 1);
      setActiveStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (!currentGroup) return;

    if (activeStoryIndex > 0) {
      setActiveStoryIndex((i) => i - 1);
    } else if (activeUserIndex > 0) {
      const prevIndex = activeUserIndex - 1;
      setActiveUserIndex(prevIndex);
      setActiveStoryIndex(groups[prevIndex].stories.length - 1);
    } else {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!onDeleteStory || !currentStory) return;
    if (!confirm("Удалить эту историю?")) return;

    setIsDeleting(true);
    try {
      await onDeleteStory(currentStory.id);
    
      if (
        activeStoryIndex >= currentGroup.stories.length - 1 &&
        activeStoryIndex > 0
      ) {
        setActiveStoryIndex((i) => i - 1);
      }
    } catch (error) {
      console.error("Failed to delete story", error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNextStory();
      } else if (e.key === "ArrowLeft") {
        handlePrevStory();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleNextStory, handlePrevStory]);

  if (!currentGroup || !currentStory) return null;

  const isOwner = currentUser && currentGroup.user.id === currentUser.id;

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1a1a] flex items-center justify-center backdrop-blur-sm">
      <button
        onClick={onClose}
        className="hidden md:block absolute top-4 right-4 text-white hover:opacity-70 transition-opacity z-[110]"
      >
        <X size={32} />
      </button>

      <div className="hidden md:block absolute top-4 left-4 text-white font-['Satisfy'] text-2xl z-[110]">
        Russiagram
      </div>

      <div className="relative w-full h-full md:h-[90vh] md:w-auto md:aspect-[9/16] flex flex-col bg-black md:rounded-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 p-3 z-20 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
          <div className="flex gap-1.5 mb-2">
            {currentGroup.stories.map((s, idx) => (
              <div
                key={s.id}
                className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className={
                    "h-full bg-white transition-all duration-300 ease-linear " +
                    (s.id === currentStory.id
                      ? "w-full"
                      : idx < activeStoryIndex
                      ? "w-full"
                      : "w-0")
                  }
                  style={
                    s.id === currentStory.id &&
                    currentStory.media_type !== "video"
                      ? {
                          transitionDuration: `${currentStory.duration}s`,
                          width: "100%",
                        }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={currentGroup.user.avatar_url}
                alt={currentGroup.user.username}
                size="sm"
                className="border border-white/20"
              />
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold leading-tight shadow-black drop-shadow-md">
                  {currentGroup.user.username}
                </span>
                <span className="text-white/70 text-[10px]">
                  {new Date(currentStory.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Trash2 size={20} className="text-white" />
                </button>
              )}
              <button onClick={onClose} className="md:hidden p-1.5">
                <X size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-black relative flex items-center justify-center">
          {currentStory.media_type === "video" ? (
            <video
              key={currentStory.id}
              src={currentStory.media_url}
              className="w-full h-full object-contain"
              autoPlay
              muted={false}
              playsInline
              onEnded={handleNextStory}
            />
          ) : (
            <img
              key={currentStory.id}
              src={currentStory.media_url}
              alt="Story"
              className="w-full h-full object-contain"
            />
          )}

          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full z-10" onClick={handlePrevStory} />
            <div
              className="w-1/3 h-full z-10"
            />
            <div className="w-1/3 h-full z-10" onClick={handleNextStory} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[44px] rounded-full border border-white/30 flex items-center px-4 text-white/70 text-sm cursor-pointer hover:bg-white/10 transition-colors">
              Отправить сообщение...
            </div>
            <button className="p-2 hover:scale-110 transition-transform">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button className="p-2 hover:scale-110 transition-transform">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handlePrevStory}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all z-[110]"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={handleNextStory}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all z-[110]"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
}
