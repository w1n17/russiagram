"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Textarea } from "@/shared/ui";
import { useUserStore } from "@/entities/user";
import { updateUserProfile } from "@/entities/user/api";
import { uploadAvatar } from "@/shared/lib/supabase/storage";
import { Camera } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const { currentUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    website: "",
  });

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        full_name: currentUser.full_name || "",
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        website: currentUser.website || "",
      });
      setAvatarPreview(currentUser.avatar_url || "");
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      let avatarUrl = currentUser.avatar_url;

      if (avatarFile) {
        const publicUrl = await uploadAvatar(currentUser.id, avatarFile);
        avatarUrl = `${publicUrl}?t=${Date.now()}`;
      }

      await updateUserProfile(currentUser.id, {
        ...formData,
        avatar_url: avatarUrl || currentUser.avatar_url,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Ошибка при обновлении профиля");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-4 border-b border-[#dbdbdb]">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-black hover:opacity-60"
          >
            Отмена
          </button>
          <h2 className="text-base font-semibold">Редактировать профиль</h2>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="text-sm font-semibold text-[#0095f6] hover:text-[#00376b] disabled:opacity-50"
          >
            {loading ? "Загрузка..." : "Готово"}
          </button>
        </div>

        <div className="max-h-[calc(90vh-60px)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-6 px-8 py-6 border-b border-[#efefef]">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                      {currentUser.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 border border-gray-200">
                  <Camera size={14} className="text-gray-700" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {currentUser.username}
                </p>
                <label className="text-sm text-[#0095f6] font-semibold cursor-pointer hover:text-[#00376b] inline-block mt-0.5">
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

            <div className="px-8 py-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                <aside className="md:w-32 md:text-right pt-2">
                  <label className="font-semibold text-sm text-[#262626]">
                    Имя
                  </label>
                </aside>
                <div className="flex-1 max-w-[355px]">
                  <Input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Имя"
                    className="w-full"
                  />
                  <p className="text-xs text-[#737373] mt-2">
                    Чтобы помочь людям находить ваш аккаунт, используйте имя,
                    под которым вас знают: ваше имя и фамилию, никнейм или
                    название компании.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                <aside className="md:w-32 md:text-right pt-2">
                  <label className="font-semibold text-sm text-[#262626]">
                    Имя пользователя
                  </label>
                </aside>
                <div className="flex-1 max-w-[355px]">
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9._]/g, ""),
                      })
                    }
                    placeholder="Имя пользователя"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-[#737373] mt-2">
                    В большинстве случаев вы сможете изменить имя пользователя
                    обратно на {currentUser.username} в течение еще 14 дней.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                <aside className="md:w-32 md:text-right pt-2">
                  <label className="font-semibold text-sm text-[#262626]">
                    Сайт
                  </label>
                </aside>
                <div className="flex-1 max-w-[355px]">
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="Сайт"
                    className="w-full"
                    disabled
                  />
                  <p className="text-xs text-[#737373] mt-2">
                    Редактирование ссылок доступно только в мобильном
                    приложении.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                <aside className="md:w-32 md:text-right pt-2">
                  <label className="font-semibold text-sm text-[#262626]">
                    О себе
                  </label>
                </aside>
                <div className="flex-1 max-w-[355px]">
                  <Textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={3}
                    maxLength={150}
                    className="w-full resize-none"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-[#c7c7c7]">
                      {formData.bio.length} / 150
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
