"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/shared/lib/supabase/client";
import { Button, Input, useToast } from "@/shared/ui";

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        toast.success("Вход выполнен успешно! 👋");


        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full">
      <div className="mb-6">
        <div className="mb-3">
          <Input
            type="email"
            placeholder="Телефон, имя пользователя или эл. адрес"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#fafafa] border-[#dbdbdb] focus:border-[#a8a8a8] rounded-[3px] text-xs h-[38px]"
          />
        </div>

        <div className="mb-3">
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-[#fafafa] border-[#dbdbdb] focus:border-[#a8a8a8] rounded-[3px] text-xs h-[38px]"
          />
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={loading}
        className="bg-[#0095f6] hover:bg-[#1877f2] text-sm font-semibold rounded-[8px] h-[36px]"
      >
        {loading ? "Вход..." : "Войти"}
      </Button>
    </form>
  );
}
