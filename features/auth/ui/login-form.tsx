'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/shared/lib/supabase/client';
import { Button, Input, useToast } from '@/shared/ui';

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Вход выполнен успешно! 👋');
        
        // Небольшая задержка для показа уведомления
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full">
      <div className="space-y-1.5">
        <Input
          type="email"
          placeholder="Телефон, имя пользователя или эл. адрес"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        {loading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}
