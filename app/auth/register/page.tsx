'use client';

import Link from 'next/link';
import { RegisterForm } from '@/features/auth/ui/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-10">
      <div className="w-full max-w-[350px]">
        {/* Main form container */}
        <div className="bg-white border border-[#dbdbdb] px-10 pt-8 pb-8 mb-2.5">
          {/* Logo */}
          <h1 className="text-center font-['Satisfy',cursive] text-[52px] mb-3">
            Russiagram
          </h1>
          
          {/* Subtitle */}
          <p className="text-center text-[#8e8e8e] font-semibold text-[17px] mb-5 px-8 leading-5">
            Зарегистрируйтесь, чтобы смотреть фото и видео ваших друзей.
          </p>
          
          {/* Facebook login placeholder */}
          <button className="w-full bg-[#0095f6] text-white font-semibold text-sm py-1.5 rounded-lg mb-4 hover:bg-[#1877f2] transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Войти через Facebook
          </button>
          
          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-[#dbdbdb]"></div>
            <div className="px-4 text-[13px] text-[#8e8e8e] font-semibold">ИЛИ</div>
            <div className="flex-1 border-t border-[#dbdbdb]"></div>
          </div>
          
          {/* Register Form */}
          <RegisterForm />
          
          {/* Terms */}
          <p className="text-xs text-[#8e8e8e] text-center mt-4 leading-4">
            Регистрируясь, вы принимаете наши{' '}
            <a href="#" className="text-[#00376b] hover:opacity-80">Условия</a>,{' '}
            <a href="#" className="text-[#00376b] hover:opacity-80">Политику конфиденциальности</a> и{' '}
            <a href="#" className="text-[#00376b] hover:opacity-80">Политику использования файлов cookie</a>.
          </p>
        </div>
        
        {/* Login container */}
        <div className="bg-white border border-[#dbdbdb] py-5 text-center text-sm">
          <span className="text-[#262626]">Есть аккаунт? </span>
          <Link href="/auth/login" className="text-[#0095f6] font-semibold hover:opacity-80">
            Войти
          </Link>
        </div>
        
        {/* Get the app */}
        <div className="mt-4">
          <p className="text-center text-sm mb-4">Установите приложение.</p>
          <div className="flex gap-2 justify-center">
            <img src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png" alt="Get it on Google Play" className="h-10" />
            <img src="https://static.cdninstagram.com/rsrc.php/v3/yu/r/EHY6QnZYdNX.png" alt="Get it from Microsoft" className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
