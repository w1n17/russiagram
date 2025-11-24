"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createStory } from "@/entities/story/api";
import { useUserStore } from "@/entities/user";
import { Story } from "@/shared/types";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (story: Story) => void;
}

export function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
}: CreateStoryModalProps) {
  const { currentUser } = useUserStore();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !file) return;

    setUploading(true);
    try {
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      const story = await createStory({
        file,
        userId: currentUser.id,
        mediaType,
      });

      if (story) {
        onStoryCreated(story);
        handleClose();
      }
    } catch (error) {
      console.error("Error creating story:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-base">Новая история</span>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {!previewUrl ? (
          <div className="p-8 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
              <svg
                aria-label="Icon to represent media such as images or videos"
                className="w-10 h-10 text-gray-400"
                fill="currentColor"
                height="96"
                role="img"
                viewBox="0 0 97.6 77.3"
                width="96"
              >
                <path
                  d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z"
                  fill="currentColor"
                ></path>
                <path
                  d="M84.7 18.4L58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.9.3L7 45.5c-1.7-3.5-2.5-7.4-2.2-11.4.4-9.1 5.2-17 12.4-23.3zm57 25.2c2.6.1 4.6 2.3 4.5 4.9-.1 2.6-2.3 4.6-4.9 4.5-2.6-.1-4.6-2.3-4.5-4.9.1-2.5 2.3-4.6 4.9-4.5zm.9-6.3h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1.5-.6 1.3-1 2.1-1zm-9.7 47c-4.5.2-8.4-3.2-8.7-7.8l-2-34c-.2-4.5 3.2-8.4 7.8-8.7l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l2 34c.2 4.5-3.2 8.4-7.8 8.7l-34.2 1.8zm-32.7-22.1l5.8-6.5c.6-.6 1.6-.6 2.2 0l6.7 6 9.6-10.8c.6-.7 1.6-.7 2.2 0l10.3 10.5c.6.6.6 1.5 0 2.1l-36.2 40.3c-.4.5-1.1.6-1.7.3-.6-.3-.9-.9-.9-1.6V54.6z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <p className="text-lg font-light">Перетащите фото или видео сюда</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={onFileChange}
                className="hidden"
              />
              <span className="bg-[#0095f6] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1877f2] transition-colors">
                Выбрать на компьютере
              </span>
            </label>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="relative aspect-[9/16] max-h-[60vh] bg-black flex items-center justify-center">
              {file && file.type.startsWith("video") ? (
                <video
                  src={previewUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}

              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleCreateStory}
                disabled={uploading}
                className="w-full h-10 rounded-lg bg-[#0095f6] text-white text-sm font-semibold disabled:opacity-50 hover:bg-[#1877f2] transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Поделиться"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
