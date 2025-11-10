'use client';

import { useState } from 'react';
import { Header } from '@/widgets/header/ui/header';
import { Heart } from 'lucide-react';

export default function NotificationsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main className="pt-14 md:pt-20 pb-14 md:pb-8 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-semibold mb-6">Уведомления</h1>
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <Heart size={96} strokeWidth={1} />
            <h2 className="text-xl font-light mt-4">Нет новых уведомлений</h2>
          </div>
        </div>
      </main>
    </>
  );
}
