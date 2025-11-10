'use client';

import { useState } from 'react';
import { Modal, Button, Textarea, Input } from '@/shared/ui';
import { createPost } from '@/entities/post';
import { useUserStore } from '@/entities/user';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { currentUser } = useUserStore();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles([file]);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || files.length === 0) return;

    setLoading(true);
    setError('');
    try {
      // Генерируем ID для поста
      const postId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Загрузка в Storage
      const { uploadPostImages } = await import('@/shared/lib/supabase/storage');
      const media_urls = await uploadPostImages(currentUser.id, postId, files);

      await createPost({
        user_id: currentUser.id,
        caption,
        location,
        media_urls,
        media_type: files.length > 1 ? 'carousel' : 'image',
      });

      handleClose();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Ошибка при создании поста');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageUrl('');
    setFiles([]);
    setCaption('');
    setLocation('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать новую публикацию"
      size="lg"
    >
      {!imageUrl ? (
        // Шаг 1: Выбор файла
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="w-24 h-24 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-light mb-6">Перетащите фото и видео сюда</h3>
          <label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="bg-[#0095f6] text-white font-semibold px-4 py-1.5 text-sm rounded-lg cursor-pointer hover:bg-[#1877f2]">
              Выбрать на компьютере
            </span>
          </label>
        </div>
      ) : (
        // Шаг 2: Редактирование
        <form onSubmit={handleSubmit} className="flex h-[540px]">
          {/* Preview слева */}
          <div className="w-[60%] bg-black flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Форма справа */}
          <div className="w-[40%] flex flex-col">
            {/* Header пользователя */}
            <div className="flex items-center gap-3 p-4 border-b border-[#dbdbdb]">
              <div className="w-7 h-7 rounded-full bg-gray-200" />
              <span className="font-semibold text-sm">igorivanov</span>
            </div>

            {/* Caption */}
            <div className="flex-1 p-4 overflow-y-auto">
              <Textarea
                placeholder="Добавьте подпись..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={2200}
                className="w-full h-[80px] resize-none border-0 focus:ring-0 text-sm"
              />
              <div className="text-xs text-[#8e8e8e] text-right mt-1">
                {caption.length}/2200
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-[#dbdbdb] p-4">
              <Input
                placeholder="Добавить место"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-0 px-0"
              />
            </div>

            {error && <p className="text-sm text-red-500 px-4">{error}</p>}

            {/* Submit */}
            <div className="border-t border-[#dbdbdb] p-3">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Публикация...' : 'Опубликовать'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
