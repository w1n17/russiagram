'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea } from '@/shared/ui';
import { useUserStore } from '@/entities/user';
import { updateUserProfile } from '@/entities/user/api';
import { supabase } from '@/shared/lib/supabase/client';
import { uploadAvatar } from '@/shared/lib/supabase/storage';
import { Camera } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { currentUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    website: '',
  });

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        full_name: currentUser.full_name || '',
        username: currentUser.username || '',
        bio: currentUser.bio || '',
        website: currentUser.website || '',
      });
      setAvatarPreview(currentUser.avatar_url || '');
    }
  }, [currentUser, isOpen]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      let avatarUrl = currentUser.avatar_url;

      // Загрузка нового аватара если выбран
      if (avatarFile) {
        avatarUrl = await uploadAvatar(currentUser.id, avatarFile);
      }

      // Обновление профиля
      await updateUserProfile(currentUser.id, {
        ...formData,
        avatar_url: avatarUrl || currentUser.avatar_url,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="bg-white">
        {/* Header */}
        <div className="border-b border-[#efefef] py-5 px-12 flex items-center justify-between gap-6">
          <button 
            onClick={onClose} 
            className="text-sm font-semibold hover:opacity-60 min-w-[60px]"
          >
            Отмена
          </button>
          <h2 className="text-base font-semibold text-center flex-1">Редактировать профиль</h2>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="text-sm font-semibold text-[#0095f6] hover:text-[#00376b] disabled:opacity-50 min-w-[60px] text-right"
          >
            {loading ? 'Сохранение...' : 'Готово'}
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
        <div className="px-12 py-10 space-y-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-5 pb-8 border-b border-[#efefef]">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                    {currentUser.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 border border-gray-300">
                <Camera size={16} />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold mb-1">{currentUser.username}</p>
              <label className="text-sm text-[#0095f6] font-semibold cursor-pointer hover:text-[#00376b] inline-block">
                Изменить фото профиля
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#262626]">Имя</label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Ваше имя"
              />
              <p className="text-xs text-[#8e8e8e] mt-1">
                Имя помогает людям находить и узнавать вас
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#262626]">Имя пользователя</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  username: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '') 
                })}
                placeholder="Имя пользователя"
                required
              />
              <p className="text-xs text-[#8e8e8e] mt-1">
                Только латинские буквы, цифры, точки и подчеркивания
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#262626]">О себе</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Расскажите о себе"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-[#8e8e8e] mt-1 text-right">
                {formData.bio.length}/150
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#262626]">Веб-сайт</label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>
        </form>
        </div>
      </div>
    </Modal>
  );
}
