"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/shared/ui/avatar";
import { useUserStore } from "@/entities/user";
import type { Story, Profile } from "@/shared/types";
import { getStoriesFeed, deleteStory } from "@/entities/story/api";
import { Plus } from "lucide-react";
import { CreateStoryModal } from "@/features/create-story";
import { StoryViewer, UserStoriesGroup } from "@/features/view-story";

export function StoriesBar() {
  const { currentUser } = useUserStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    loadStories();

  }, [currentUser?.id]);

  const loadStories = async () => {
    try {
      const data = await getStoriesFeed(currentUser?.id);
      setStories(data);
    } catch (error) {
      console.error("Error loading stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const groups: UserStoriesGroup[] = useMemo(() => {
    const byUser = new Map<string, UserStoriesGroup>();

    for (const story of stories) {
      const user = (story as any).user as Profile | undefined;
      if (!user) continue;
      const existing = byUser.get(user.id);
      if (!existing) {
        byUser.set(user.id, { user, stories: [story] });
      } else {
        existing.stories.push(story);
      }
    }

    let list = Array.from(byUser.values());

    if (currentUser) {
      list = list.sort((a, b) => {
        if (a.user.id === currentUser.id) return -1;
        if (b.user.id === currentUser.id) return 1;
        return 0;
      });
    }

    return list;
  }, [stories, currentUser]);

  const currentUserGroupIndex = useMemo(() => {
    if (!currentUser) return -1;
    return groups.findIndex((g) => g.user.id === currentUser.id);
  }, [groups, currentUser]);

  const openViewerForUser = (groupIndex: number) => {
    if (groupIndex < 0 || groupIndex >= groups.length) return;
    setActiveGroupIndex(groupIndex);
    setIsViewerOpen(true);
  };

  const handleStoryViewed = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, is_viewed: true } : s))
    );
  };

  const handleStoryCreated = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
  };

  const handleStoryDeleted = async (storyId: string) => {
    await deleteStory(storyId);
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const handleMyStoryClick = () => {
    if (currentUserGroupIndex !== -1) {
      openViewerForUser(currentUserGroupIndex);
    } else {
      setIsCreateOpen(true);
    }
  };

  if (loading && stories.length === 0) {
    return null;
  }

  const otherGroups = groups.filter((g) => g.user.id !== currentUser?.id);

  return (
    <>
      <div className="w-full mb-6 bg-white border-b border-[#dbdbdb] py-4 md:bg-transparent md:border-none md:py-2">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-4 py-2">
          {currentUser && (
            <button
              type="button"
              onClick={handleMyStoryClick}
              className="flex flex-col items-center justify-center mr-1 shrink-0"
            >
              <div className="relative">
                <Avatar
                  src={currentUser.avatar_url}
                  alt={currentUser.username}
                  size="lg"
                  hasStory={currentUserGroupIndex !== -1}
                />
                {currentUserGroupIndex === -1 && (
                  <div className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-[#0095f6] flex items-center justify-center border-[2px] border-white">
                    <Plus size={14} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <span className="mt-1.5 text-xs text-[#262626] w-[74px] truncate text-center">
                Ваша история
              </span>
            </button>
          )}

          {otherGroups.map((group) => {
            // Находим реальный индекс в полном массиве groups
            const realIndex = groups.findIndex(
              (g) => g.user.id === group.user.id
            );
            const hasUnviewed = group.stories.some((s) => !s.is_viewed);

            return (
              <button
                key={group.user.id}
                type="button"
                onClick={() => openViewerForUser(realIndex)}
                className="flex flex-col items-center justify-center mr-1 shrink-0"
              >
                <Avatar
                  src={group.user.avatar_url}
                  alt={group.user.username}
                  size="lg"
                  hasStory={hasUnviewed}
                />
                <span className="mt-1.5 text-xs text-[#262626] w-[74px] truncate text-center">
                  {group.user.username}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isViewerOpen && (
        <div className="fixed inset-0 z-[100]">
          {" "}
          <StoryViewer
            initialGroupIndex={activeGroupIndex}
            groups={groups}
            onClose={() => setIsViewerOpen(false)}
            onViewStory={handleStoryViewed}
            onDeleteStory={handleStoryDeleted}
          />
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-[100]">
          <CreateStoryModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onStoryCreated={handleStoryCreated}
          />
        </div>
      )}
    </>
  );
}
