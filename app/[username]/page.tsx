'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/widgets/header/ui/header';
import { Avatar, Button } from '@/shared/ui';
import { getUserByUsername, useUserStore } from '@/entities/user';
import { getUserPosts } from '@/entities/post';
import { Profile, Post } from '@/shared/types';
import { Settings, Grid, Bookmark, User as UserIcon, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { formatNumber } from '@/shared/lib/utils';
import { CreatePostModal } from '@/features/create-post/ui/create-post-modal';
import { EditProfileModal } from '@/features/profile/ui/edit-profile-modal';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { currentUser, loading: userLoading } = useUserStore();
  
  // Вычисляем isOwnProfile напрямую - ТОЛЬКО если пользователь залогинен
  const isOwnProfile = Boolean(
    !userLoading && 
    currentUser && 
    profile && 
    currentUser.id === profile.id
  );
  

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const profileData = await getUserByUsername(username);
      setProfile(profileData);

      if (profileData) {
        const postsData = await getUserPosts(profileData.id);
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header onCreateClick={() => setIsCreateModalOpen(true)} />
        <main className="pt-20 pb-8 min-h-screen">
          <div className="text-center py-8">Загрузка...</div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header onCreateClick={() => setIsCreateModalOpen(true)} />
        <main className="pt-20 pb-8 min-h-screen">
          <div className="text-center py-8">
            <p className="text-gray-500">Пользователь не найден</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main className="min-h-screen bg-[#fafafa]">
        {/* Отступ от header - ГАРАНТИРОВАННЫЙ! */}
        <div className="h-[60px]"></div>
        <div className="py-8 flex justify-center">
          <div className="w-full max-w-[935px] px-5">
            {/* Profile Header */}
            <div className="bg-white mb-11 px-5 py-11">
            <div className="flex items-start gap-7 md:gap-[90px] mb-11">
              {/* Avatar */}
              <div className="flex-shrink-0 ml-5 md:ml-[70px]">
                <Avatar 
                  src={profile.avatar_url} 
                  alt={profile.username} 
                  size="xl" 
                  className="w-[77px] h-[77px] md:w-[150px] md:h-[150px]"
                />
              </div>

              {/* Info */}
              <div className="flex-1 pt-3">
                {/* Username and buttons */}
                <div className="flex items-center gap-5 mb-5">
                  <h1 className="text-xl font-light">{profile.username}</h1>
                  {!userLoading && (
                    isOwnProfile ? (
                      // ЭТО СВОЙ ПРОФИЛЬ - показываем "Редактировать"
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 px-4 text-sm font-semibold"
                          onClick={() => setIsEditModalOpen(true)}
                        >
                          Редактировать профиль
                        </Button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                          <Settings size={24} strokeWidth={1.5} />
                        </button>
                      </>
                    ) : (
                      // ЧУЖОЙ ПРОФИЛЬ или НЕ ЗАЛОГИНЕН - показываем кнопки подписки
                      <>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="h-8 px-4 text-sm font-semibold"
                          onClick={() => {
                            if (!currentUser) {
                              window.location.href = '/auth/login';
                            } else {
                              alert('Функция подписки в разработке');
                            }
                          }}
                        >
                          Подписаться
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 px-4 text-sm font-semibold"
                          onClick={() => {
                            if (!currentUser) {
                              window.location.href = '/auth/login';
                            } else {
                              alert('Функция сообщений в разработке');
                            }
                          }}
                        >
                          Сообщение
                        </Button>
                      </>
                    )
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-10 mb-5">
                  <div>
                    <span className="font-semibold">{formatNumber(profile.posts_count)}</span>
                    {' '}
                    <span className="text-[#262626]">публикаций</span>
                  </div>
                  <button className="hover:opacity-60">
                    <span className="font-semibold">{formatNumber(profile.followers_count)}</span>
                    {' '}
                    <span className="text-[#262626]">подписчиков</span>
                  </button>
                  <button className="hover:opacity-60">
                    <span className="font-semibold">{formatNumber(profile.following_count)}</span>
                    {' '}
                    <span className="text-[#262626]">подписок</span>
                  </button>
                </div>

                {/* Bio */}
                <div>
                  {profile.full_name && (
                    <p className="font-semibold text-sm mb-1">{profile.full_name}</p>
                  )}
                  {profile.bio && (
                    <p className="whitespace-pre-wrap text-sm">{profile.bio}</p>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00376b] font-semibold text-sm hover:underline"
                    >
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>
            </div>
            </div>

              {/* Tabs */}
            <div className="bg-white border-t border-[#dbdbdb]">
              <div className="flex justify-center gap-16">
              <button 
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-1.5 py-[18px] ${activeTab === 'posts' ? 'border-t border-black -mt-px' : ''} text-xs font-semibold uppercase tracking-wider ${activeTab === 'posts' ? '' : 'text-[#8e8e8e]'}`}
              >
                <Grid size={12} />
                <span>Публикации</span>
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-1.5 py-[18px] ${activeTab === 'saved' ? 'border-t border-black -mt-px' : ''} text-xs font-semibold uppercase tracking-wider ${activeTab === 'saved' ? '' : 'text-[#8e8e8e]'} hover:text-[#262626]`}
              >
                <Bookmark size={12} />
                <span>Сохранённое</span>
              </button>
              </div>
            </div>

            {/* Posts Grid */}
            {activeTab === 'posts' ? (
            posts.length > 0 ? (
              <div className="bg-white px-5 py-8">
                <div className="grid grid-cols-3 gap-[28px]">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square bg-gray-100 cursor-pointer group"
                >
                  <Image
                    src={post.media_urls[0]}
                    alt="Post"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 293px"
                  />
                  {/* Hover overlay как в Instagram */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-8 text-white font-semibold">
                    <div className="flex items-center gap-2">
                      <Heart size={19} fill="white" />
                      <span>{formatNumber(post.likes_count)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={19} fill="white" />
                      <span>{formatNumber(post.comments_count)}</span>
                    </div>
                  </div>
                </div>
              ))}
                </div>
              </div>
            ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full border-2 border-[#262626] flex items-center justify-center mb-6">
                <Grid size={32} />
              </div>
              <p className="text-2xl font-light mb-2">Нет публикаций</p>
            </div>
          )
          ) : (
            <div className="bg-white flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full border-2 border-[#262626] flex items-center justify-center mb-6">
                <Bookmark size={32} />
              </div>
              <p className="text-2xl font-light mb-2">Сохранённых публикаций пока нет</p>
              <p className="text-sm text-[#8e8e8e]">Сохраняйте понравившиеся посты</p>
            </div>
          )}
          </div>
        </div>
      </main>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          loadProfile(); // Перезагружаем профиль после редактирования
        }}
      />
    </>
  );
}
