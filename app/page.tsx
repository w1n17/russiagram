"use client";

import { useState } from "react";
import { Header } from "@/widgets/header/ui/header";
import { Feed } from "@/widgets/feed/ui/feed";
import { CreatePostModal } from "@/features/create-post/ui/create-post-modal";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <main
        className="pt-[110px] pb-20 md:pb-8 bg-[#fafafa] min-h-screen"
        style={{ paddingTop: "110px" }}
      >
        <Feed />
      </main>
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
