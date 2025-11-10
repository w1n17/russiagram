'use client';

import { useState } from 'react';
import { Header } from '@/widgets/header/ui/header';
import { Compass } from 'lucide-react';

export default function ExplorePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main className="pt-14 md:pt-20 pb-14 md:pb-8 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <Compass size={96} strokeWidth={1} />
            <h2 className="text-2xl font-light mt-4">Обзор</h2>
            <p className="text-sm mt-2">Находите новые публикации и людей</p>
          </div>
        </div>
      </main>
    </>
  );
}
