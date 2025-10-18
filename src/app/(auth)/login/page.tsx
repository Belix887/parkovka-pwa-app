"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      
      if (res.ok) {
        showSuccess("Вход выполнен", "Добро пожаловать!");
        router.push("/profile");
      } else {
        const errorData = await res.json();
        showError("Ошибка входа", errorData.error || "Неверные данные");
      }
    } catch (err: any) {
      showError("Ошибка сети", "Проверьте подключение к интернету");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container max-w-md">
        <MotionCard className="w-full">
          <CardHeader 
            title="Вход в аккаунт" 
            subtitle="Введите свои данные для входа"
            icon="🔐"
          />
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <Input
                name="email"
                label="Email"
                type="email"
                placeholder="your@email.com"
                icon="📧"
                required
              />
              
              <Input
                name="password"
                label="Пароль"
                type="password"
                placeholder="Введите пароль"
                icon="🔒"
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-surface)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)] focus:ring-2"
                  />
                  Запомнить меня
                </label>
                <Link 
                  href="/forgot" 
                  className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:opacity-80 transition-colors duration-300"
                >
                  Забыли пароль?
                </Link>
              </div>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full"
                icon="🚀"
              >
                {loading ? "Вход..." : "Войти"}
              </Button>
            </form>
          </CardContent>
          
          <div className="mt-6 pt-6 border-t border-[var(--border-primary)] text-center">
            <p className="text-[var(--text-secondary)] text-sm">
              Нет аккаунта?{" "}
              <Link 
                href="/register" 
                className="text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:opacity-80 transition-colors duration-300 font-medium"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}


