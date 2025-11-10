import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/shared/ui";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Russiagram - Instagram Clone",
  description: "Instagram clone with Next.js, TypeScript, and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Satisfy&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <ToastContainer />
      </body>
    </html>
  );
}
