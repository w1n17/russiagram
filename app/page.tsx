'use client';

import { useState } from 'react';
import { Header } from '@/widgets/header/ui/header';
import { Feed } from '@/widgets/feed/ui/feed';
import { CreatePostModal } from '@/features/create-post/ui/create-post-modal';

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main className="pt-[80px] md:pt-[80px] pb-14 md:pb-0 min-h-screen bg-[#fafafa]">
        <Feed />
      </main>
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
