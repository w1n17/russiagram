"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/widgets/header/ui/header";
import { Avatar, Button } from "@/shared/ui";
import { ArrowLeft, X } from "lucide-react";
import { supabase } from "@/shared/lib/supabase/client";
import { Profile } from "@/shared/types";
import { CreatePostModal } from "@/features/create-post/ui/create-post-modal";

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadFollowing();
  }, [username]);

  const loadFollowing = async () => {
    try {
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (userError || !user) {
        console.error("Error loading user for following:", userError);
        setFollowing([]);
        return;
      }

      const { data, error } = await supabase
        .from("follows")
        .select(
          "following:profiles!follows_following_id_fkey(id, username, full_name, avatar_url)"
        )
        .eq("follower_id", (user as any).id);

      if (error || !data) {
        console.error("Error loading following:", error);
        setFollowing([]);
        return;
      }

      const list = (data as any[])
        .map((row) => row.following as Profile)
        .filter(Boolean);
      setFollowing(list);
    } catch (error) {
      console.error("Error loading following:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main
        className="pt-[110px] pb-14 md:pb-8 min-h-screen bg-white flex flex-col items-center"
        style={{ paddingTop: "110px" }}
      >
        <div className="w-full max-w-[600px] mx-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <button onClick={() => router.back()} className="p-2">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-base font-semibold">{username}</h1>
            <button onClick={() => router.back()} className="p-2">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 border-b border-gray-200">
            <button
              onClick={() => router.push(`/${username}/followers`)}
              className="py-3 text-sm text-gray-500"
            >
              Подписчики
            </button>
            <button className="py-3 text-sm font-semibold border-b-2 border-black">
              Подписки
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Загрузка...</div>
            ) : following.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="font-semibold mb-2">Нет подписок</p>
                <p className="text-sm">
                  Этот аккаунт пока ни на кого не подписан
                </p>
              </div>
            ) : (
              following.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatar_url}
                      alt={user.username}
                      size="md"
                    />
                    <div>
                      <p className="font-semibold text-sm">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.full_name}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Отписаться
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
