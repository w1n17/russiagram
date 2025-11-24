"use client";

import Link from "next/link";
import { LoginForm } from "@/features/auth/ui/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-10">
      <div className="w-full max-w-[350px]">
        <div className="bg-white border border-[#dbdbdb] px-10 pt-10 pb-10 mb-3">
          <h1 className="text-center font-['Satisfy',cursive] text-[52px] mb-8 mt-2">
            Russiagram
          </h1>

          <div className="mt-6 mb-6">
            <LoginForm />
          </div>
        </div>

        <div className="bg-white border border-[#dbdbdb] py-6 text-center text-sm">
          <span className="text-[#262626]">У вас нет аккаунта? </span>{" "}
          <Link
            href="/auth/register"
            className="text-[#0095f6] font-semibold hover:opacity-80"
          >
            Зарегистрируйтесь
          </Link>
        </div>
      </div>
    </div>
  );
}
