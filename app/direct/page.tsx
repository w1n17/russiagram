'use client';

import { useState } from 'react';
import { Header } from '@/widgets/header/ui/header';
import { MessageCircle } from 'lucide-react';

export default function DirectPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main className="pt-14 md:pt-20 pb-14 md:pb-8 min-h-screen max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row h-[calc(100vh-7rem)] md:h-[calc(100vh-5rem)]">
          {/* Conversations List */}
          <div className="w-full md:w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold">Сообщения</h1>
            </div>
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
              <MessageCircle size={64} />
              <p className="mt-4">Нет сообщений</p>
            </div>
          </div>

          {/* Conversation View */}
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle size={96} strokeWidth={1} />
            <h2 className="text-2xl font-light mt-4">Ваши сообщения</h2>
            <p className="text-sm mt-2">Отправляйте личные фото и сообщения друзьям</p>
          </div>
        </div>
      </main>
    </>
  );
}
