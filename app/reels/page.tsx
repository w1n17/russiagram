'use client';

import { useState } from 'react';
import { Header } from '@/widgets/header/ui/header';
import { Film } from 'lucide-react';

export default function ReelsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main className="pt-14 md:pt-20 pb-14 md:pb-8 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Film size={96} strokeWidth={1} />
          <h2 className="text-2xl font-light mt-4">Рилсы пока недоступны</h2>
          <p className="text-sm mt-2 text-gray-400">
            Функционал рилсов в разработке
          </p>
        </div>
      </main>
    </>
  );
}
