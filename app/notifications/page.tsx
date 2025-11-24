"use client";

import { useEffect, useState } from "react";
import { Header } from "@/widgets/header/ui/header";
import { Avatar } from "@/shared/ui";
import { Heart } from "lucide-react";
import { useUserStore } from "@/entities/user";
import {
  getUserNotifications,
  NotificationWithActor,
} from "@/entities/notification/api";
import { formatTimeAgo } from "@/shared/lib/utils";
import { CreatePostModal } from "@/features/create-post/ui/create-post-modal";

export default function NotificationsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithActor[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await getUserNotifications(currentUser.id);
        setNotifications(data);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser?.id]);

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main
        className="pt-[110px] pb-14 md:pb-8 min-h-screen bg-[#fafafa] flex flex-col items-center"
        style={{ paddingTop: "110px" }}
      >
        <div className="w-full max-w-[600px] px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6">Уведомления</h1>

          {!currentUser && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-sm">
                Войдите, чтобы просматривать уведомления
              </p>
            </div>
          )}

          {currentUser && (
            <>
              {loading ? (
                <div className="p-8 text-center text-gray-500">Загрузка...</div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-72 text-gray-400">
                  <Heart size={64} strokeWidth={1} />
                  <h2 className="text-xl font-light mt-4">
                    У вас пока нет уведомлений
                  </h2>
                  <p className="text-sm mt-2 text-gray-500">
                    Когда кто-то будет ставить лайки, комментировать или
                    подписываться, они появятся здесь
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#dbdbdb] bg-white md:rounded-lg md:border md:border-[#dbdbdb]">
                  {notifications.map((n) => {
                    const actor = n.actor;
                    let text = "";

                    switch (n.type) {
                      case "like":
                        text = "нравится ваша публикация";
                        break;
                      case "comment":
                        text = "прокомментировал(а) вашу публикацию";
                        break;
                      case "follow":
                        text = "подписался(ась) на вас";
                        break;
                      case "mention":
                        text = "упомянул(а) вас в комментарии";
                        break;
                      case "message":
                        text = "отправил(а) вам сообщение";
                        break;
                      default:
                        text = "действие";
                    }

                    return (
                      <li
                        key={n.id}
                        className="flex items-center gap-3 px-4 py-3 bg-white"
                      >
                        <Avatar
                          src={actor?.avatar_url}
                          alt={actor?.username || "Пользователь"}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#262626]">
                            <span className="font-semibold mr-1">
                              {actor?.username || "Кто-то"}
                            </span>
                            {text}
                          </p>
                          <p className="text-xs text-[#8e8e8e] mt-0.5">
                            {formatTimeAgo(n.created_at)}
                          </p>
                        </div>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#0095f6]" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
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
