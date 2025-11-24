"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/widgets/header/ui/header";
import { Avatar } from "@/shared/ui";
import { X } from "lucide-react";
import { supabase } from "@/shared/lib/supabase/client";
import { Profile } from "@/shared/types";
import Link from "next/link";
import { CreatePostModal } from "@/features/create-post/ui/create-post-modal";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const recent = localStorage.getItem("recentSearches");
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      searchUsers();
    } else {
      setResults([]);
    }
  }, [query]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = (username: string) => {
    const updated = [
      username,
      ...recentSearches.filter((s) => s !== username),
    ].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main
        className="pt-[110px] pb-14 md:pb-8 min-h-screen bg-[#fafafa] flex flex-col items-center"
        style={{ paddingTop: "110px" }}
      >
        <div className="w-full max-w-[600px] bg-white md:border md:border-[#dbdbdb] min-h-screen">
          <div className="sticky top-[60px] bg-white border-b border-[#dbdbdb] px-4 py-2.5 z-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-[#efefef] rounded-lg text-sm focus:outline-none placeholder:text-[#8e8e8e]"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <div className="bg-[#c7c7c7] rounded-full p-0.5">
                    <X size={12} className="text-white" strokeWidth={3} />
                  </div>
                </button>
              )}
            </div>
          </div>


          <div className="flex flex-col gap-2 p-2">
            {query.trim().length === 0 ? (
              <div>
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-4 py-4">
                      <h2 className="font-semibold text-base">Недавнее</h2>
                      <button
                        onClick={clearRecentSearches}
                        className="text-sm text-[#0095f6] hover:text-[#00376b] font-semibold active:opacity-60"
                      >
                        Очистить все
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <Link
                        key={index}
                        href={`/${search}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] active:bg-[#f0f0f0] transition-colors rounded-lg border border-transparent hover:border-[#dbdbdb]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden border border-[#dbdbdb]">

                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <span className="text-lg text-gray-400 uppercase">
                                {search[0]}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-semibold text-[#262626]">
                              {search}
                            </span>
                            <span className="text-[14px] text-[#8e8e8e]">
                              Пользователь
                            </span>
                          </div>
                        </div>
                        <X
                          size={20}
                          className="text-[#8e8e8e]"
                          onClick={(e) => {
                            e.preventDefault();
                            const updated = recentSearches.filter(
                              (s) => s !== search
                            );
                            setRecentSearches(updated);
                            localStorage.setItem(
                              "recentSearches",
                              JSON.stringify(updated)
                            );
                          }}
                        />
                      </Link>
                    ))}
                  </>
                )}
                {recentSearches.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <p className="text-sm font-semibold text-[#8e8e8e]">
                      Нет недавних запросов.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Поиск...</div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="font-semibold mb-2">Результатов не найдено</p>
                    <p className="text-sm">Попробуйте другой запрос</p>
                  </div>
                ) : (
                  results.map((user) => (
                    <Link
                      key={user.id}
                      href={`/${user.username}`}
                      onClick={() => saveSearch(user.username)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors rounded-lg border border-transparent hover:border-[#dbdbdb]"
                    >
                      <Avatar
                        src={user.avatar_url}
                        alt={user.username}
                        size="md"
                        className="w-11 h-11"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[14px] text-[#262626] truncate">
                          {user.username}
                        </p>
                        <p className="text-[14px] text-[#8e8e8e] truncate">
                          {user.full_name}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
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
