'use client';

import Link from 'next/link';
import { Home, Search, PlusSquare, Heart, MessageCircle, User } from 'lucide-react';
import { Avatar } from '@/shared/ui';
import { ROUTES } from '@/shared/lib/constants';
import { useUserStore } from '@/entities/user';

interface HeaderProps {
  onCreateClick?: () => void;
}

export function Header({ onCreateClick }: HeaderProps) {
  const { currentUser } = useUserStore();

  return (
    <>
      <header className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-[#dbdbdb] z-40">
        <div className="w-full px-5 h-[60px] flex items-center justify-center">
          <div className="max-w-[935px] w-full flex items-center justify-between gap-8">
          <Link href={ROUTES.HOME} className="font-['Satisfy',cursive] text-3xl shrink-0">
            Russiagram
          </Link>


          <Link href="/search" className="flex-1 max-w-[268px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск"
                readOnly
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/search';
                }}
                className="w-full h-9 pl-4 pr-4 bg-[#efefef] rounded-lg text-sm focus:outline-none placeholder:text-[#8e8e8e] border-0 cursor-pointer"
              />
            </div>
          </Link>

          <nav className="flex items-center gap-5">
            <Link href={ROUTES.HOME} className="hover:opacity-60 transition-opacity">
              <Home size={24} strokeWidth={1.5} />
            </Link>
            <Link href={ROUTES.MESSAGES} className="hover:opacity-60 transition-opacity">
              <MessageCircle size={24} strokeWidth={1.5} />
            </Link>
            <button onClick={onCreateClick} className="hover:opacity-60 transition-opacity">
              <PlusSquare size={24} strokeWidth={1.5} />
            </button>
            <Link href="/search" className="hover:opacity-60 transition-opacity">
              <Search size={24} strokeWidth={1.5} />
            </Link>
            <Link href="/notifications" className="hover:opacity-60 transition-opacity">
              <Heart size={24} strokeWidth={1.5} />
            </Link>
            {currentUser ? (
              <Link href={`/${currentUser.username}`} className="hover:opacity-60 transition-opacity">
                <Avatar src={currentUser.avatar_url} alt={currentUser.username} size="xs" />
              </Link>
            ) : (
              <Link href="/auth/login" className="hover:opacity-60 transition-opacity">
                <User size={24} strokeWidth={1.5} />
              </Link>
            )}
          </nav>
          </div>
        </div>
      </header>

      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#dbdbdb] z-40">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <Link href={ROUTES.HOME} className="font-['Satisfy',cursive] text-2xl">
            Russiagram
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={onCreateClick} className="hover:opacity-60 transition-opacity">
              <PlusSquare size={24} strokeWidth={1.5} />
            </button>
            <Link href={ROUTES.NOTIFICATIONS} className="hover:opacity-60 transition-opacity">
              <Heart size={24} strokeWidth={1.5} />
            </Link>
            <Link href={ROUTES.MESSAGES} className="hover:opacity-60 transition-opacity">
              <MessageCircle size={24} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbdbdb] z-50">
        <div className="flex items-center justify-around h-14">
          <Link href={ROUTES.HOME} className="flex flex-col items-center justify-center flex-1 hover:opacity-60 transition-opacity">
            <Home size={24} strokeWidth={1.5} />
          </Link>
          <Link href="/search" className="flex flex-col items-center justify-center flex-1 hover:opacity-60 transition-opacity">
            <Search size={24} strokeWidth={1.5} />
          </Link>
          <Link href={ROUTES.REELS} className="flex flex-col items-center justify-center flex-1 hover:opacity-60 transition-opacity">
            <PlusSquare size={24} strokeWidth={1.5} />
          </Link>
          {currentUser ? (
            <Link href={ROUTES.PROFILE(currentUser.username)} className="flex flex-col items-center justify-center flex-1">
              <Avatar src={currentUser.avatar_url} alt={currentUser.username} size="sm" />
            </Link>
          ) : (
            <Link href="/auth/login" className="flex flex-col items-center justify-center flex-1 hover:opacity-60 transition-opacity">
              <User size={24} strokeWidth={1.5} />
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
