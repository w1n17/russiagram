'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/shared/lib/supabase/client';
import { Button, Input, useToast } from '@/shared/ui';

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Регистрация с передачей username и full_name в метаданные
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          }
        }
      });

      if (authError) throw authError;

      // Профиль создастся автоматически через триггер
      if (authData.user) {
        toast.success('Регистрация успешна! Добро пожаловать в Russiagram! 🎉');
        
        // Небольшая задержка для показа уведомления
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="w-full">
      <div className="space-y-1.5">
        <Input
          type="email"
          placeholder="Моб. телефон или эл. адрес"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />

        <Input
          type="text"
          placeholder="Полное имя"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full"
        />

        <Input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
          required
          className="w-full"
        />

        <Input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full"
        />
      </div>

      <Button type="submit" fullWidth disabled={loading} className="mt-3">
        {loading ? 'Регистрация...' : 'Регистрация'}
      </Button>
    </form>
  );
}
