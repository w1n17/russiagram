"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/widgets/header/ui/header";
import { MessageCircle } from "lucide-react";
import { CreatePostModal } from "@/features/create-post/ui/create-post-modal";
import { Avatar } from "@/shared/ui";
import { useUserStore } from "@/entities/user";
import { Conversation, Message, Profile } from "@/shared/types";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  createConversation,
} from "@/entities/message/api";
import { supabase } from "@/shared/lib/supabase/client";
import { formatTimeAgo } from "@/shared/lib/utils";

function DirectPageContent() {
  const searchParams = useSearchParams();
  const { currentUser } = useUserStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<Profile[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSelectedConversationId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!currentUser) {
      setLoadingConversations(false);
      return;
    }

    const load = async () => {
      try {
        const data = await getUserConversations(currentUser.id);
        setConversations(data);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoadingConversations(false);
      }
    };

    load();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await getConversationMessages(selectedConversationId);
        setMessages(data);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    const channel = supabase
      .channel(`chat:${selectedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === currentUser?.id) return; 

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, currentUser?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedConversationId || !newMessage.trim()) return;

    try {
      const message = await sendMessage({
        conversation_id: selectedConversationId,
        sender_id: currentUser.id,
        content: newMessage.trim(),
      });

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setUserQuery(q);
    if (!currentUser || !q.trim()) {
      setUserResults([]);
      return;
    }

    setUserSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .ilike("username", `%${q}%`)
        .neq("id", currentUser.id)
        .limit(20);

      if (error) throw error;
      setUserResults((data || []) as Profile[]);
    } catch (error) {
      console.error("Error searching users for chat:", error);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleStartConversation = async (user: Profile) => {
    if (!currentUser) return;
    try {
      const conv = await createConversation([currentUser.id, user.id]);
      setConversations((prev) => [conv, ...prev]);
      setIsNewChatOpen(false);
      setUserQuery("");
      setUserResults([]);
      setSelectedConversationId(conv.id);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  if (!currentUser) {
    return (
      <>
        <Header onCreateClick={() => setIsCreateModalOpen(true)} />
        <main className="pt-[76px] pb-14 md:pb-8 min-h-screen bg-[#fafafa]">
          <div className="max-w-5xl mx-auto flex items-center justify-center h-[calc(100vh-7rem)] text-gray-500">
            <p className="text-sm">
              Войдите, чтобы просматривать и отправлять сообщения.
            </p>
          </div>
        </main>
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main
        className="pt-[110px] pb-14 md:pb-8 min-h-screen bg-[#fafafa] flex justify-center"
        style={{ paddingTop: "110px" }}
      >
        <div className="w-full max-w-5xl h-[calc(100vh-9rem)] md:h-[calc(100vh-8rem)] bg-white border border-[#dbdbdb]">
          <div className="flex h-full">
            <div
              className={`w-full md:w-1/3 border-r border-[#dbdbdb] flex-col ${
                selectedConversationId ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#dbdbdb]">
                <span className="font-semibold">{currentUser.username}</span>
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="text-[#0095f6] text-sm font-semibold"
                >
                  Новое сообщение
                </button>
              </div>

              {loadingConversations ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  Загрузка...
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm px-4 text-center">
                  <MessageCircle size={48} className="mb-3" />
                  <p>У вас пока нет диалогов.</p>
                  <p className="mt-1 text-xs">
                    Нажмите «Новое сообщение», чтобы начать общение.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={
                        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fafafa] " +
                        (conv.id === selectedConversationId
                          ? "bg-[#fafafa]"
                          : "")
                      }
                    >
                      <div className="shrink-0">
                        <Avatar
                          src={conv.avatar_url || undefined}
                          alt={conv.name || "Диалог"}
                          size="md"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {conv.name || "Диалог"}
                        </p>
                        {conv.last_message && (
                          <p className="text-xs text-[#8e8e8e] truncate">
                            {conv.last_message.sender?.username
                              ? `${conv.last_message.sender.username}: `
                              : ""}
                            {conv.last_message.content || "Вложение"}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`flex-1 flex-col ${
                selectedConversationId ? "flex" : "hidden md:flex"
              }`}
            >
              {!selectedConversationId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <MessageCircle size={96} strokeWidth={1} />
                  <h2 className="text-2xl font-light mt-4">Ваши сообщения</h2>
                  <p className="text-sm mt-2">
                    Выберите диалог или начните новый.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#dbdbdb]">
                    <button
                      onClick={() => setSelectedConversationId(null)}
                      className="md:hidden mr-2"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M19 12H5M12 19l-7-7 7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <Avatar
                      src={
                        conversations.find(
                          (c) => c.id === selectedConversationId
                        )?.avatar_url || undefined
                      }
                      alt="User"
                      size="sm"
                    />
                    <span className="font-semibold text-sm">
                      {conversations.find(
                        (c) => c.id === selectedConversationId
                      )?.name || "Диалог"}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#fafafa]">
                    {loadingMessages ? (
                      <div className="text-center text-gray-500 text-sm mt-4">
                        Загрузка...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-sm mt-8">
                        <p>Сообщений пока нет.</p>
                        <p className="mt-1 text-xs">
                          Напишите первое сообщение.
                        </p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isOwn = m.sender_id === currentUser.id;
                        return (
                          <div
                            key={m.id}
                            className={
                              "flex mb-1 " +
                              (isOwn ? "justify-end" : "justify-start")
                            }
                          >
                            <div className="max-w-[70%]">
                              <div
                                className={
                                  "rounded-2xl px-3 py-2 text-sm " +
                                  (isOwn
                                    ? "bg-[#0095f6] text-white rounded-br-sm"
                                    : "bg-white text-[#262626] border border-[#dbdbdb] rounded-bl-sm")
                                }
                              >
                                {m.content || "Вложение"}
                              </div>
                              <div className="mt-0.5 text-[10px] text-[#8e8e8e] text-right">
                                {formatTimeAgo(m.created_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSend}
                    className="border-t border-[#dbdbdb] px-4 py-3 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        className="flex-1 text-sm border border-[#dbdbdb] rounded-full px-3 py-2 outline-none"
                        placeholder="Напишите сообщение..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="text-[#0095f6] text-sm font-semibold disabled:opacity-40"
                      >
                        Отправить
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#dbdbdb] flex items-center justify-between">
              <span className="font-semibold text-sm">Новое сообщение</span>
              <button
                onClick={() => {
                  setIsNewChatOpen(false);
                  setUserQuery("");
                  setUserResults([]);
                }}
                className="text-sm text-[#0095f6]"
              >
                Отмена
              </button>
            </div>
            <div className="px-4 py-3 border-b border-[#dbdbdb]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Кому:</span>
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="flex-1 text-sm outline-none"
                  placeholder="Имя пользователя"
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {userSearchLoading ? (
                <div className="p-4 text-sm text-gray-500">Поиск...</div>
              ) : userResults.length === 0 && userQuery.trim().length > 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  Пользователи не найдены.
                </div>
              ) : (
                userResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartConversation(user)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#fafafa] text-left"
                  >
                    <Avatar
                      src={user.avatar_url}
                      alt={user.username}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {user.username}
                      </p>
                      {user.full_name && (
                        <p className="text-xs text-[#8e8e8e] truncate">
                          {user.full_name}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <DirectPageContent />
    </Suspense>
  );
}
