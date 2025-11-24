"use client";

import Link from "next/link";
import { RegisterForm } from "@/features/auth/ui/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-10">
      <div className="w-full max-w-[350px]">
        <div className="bg-white border border-[#dbdbdb] px-10 pt-10 pb-10 mb-3">
          <h1 className="text-center font-['Satisfy',cursive] text-[52px] mb-6">
            Russiagram
          </h1>

          <p className="text-center text-[#8e8e8e] font-semibold text-[17px] mb-8 px-4 leading-5">
            Зарегистрируйтесь, чтобы смотреть фото и видео ваших друзей.
          </p>

          <div className="mt-6">
            <RegisterForm />
          </div>

          <p className="text-xs text-[#8e8e8e] text-center mt-6 leading-4">
            Регистрируясь, вы принимаете наши{" "}
            <a href="#" className="text-[#00376b] hover:opacity-80">
              Условия
            </a>
            ,{" "}
            <a href="#" className="text-[#00376b] hover:opacity-80">
              Политику конфиденциальности
            </a>{" "}
            и{" "}
            <a href="#" className="text-[#00376b] hover:opacity-80">
              Политику использования файлов cookie
            </a>
            .
          </p>
        </div>

        <div className="bg-white border border-[#dbdbdb] py-6 text-center text-sm">
          <span className="text-[#262626]">Есть аккаунт? </span>
          <Link
            href="/auth/login"
            className="text-[#0095f6] font-semibold hover:opacity-80"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
