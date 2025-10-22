"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    const form = new FormData(formEl);
    const payload = Object.fromEntries(form.entries());
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      
      if (res.ok) {
        showSuccess("Регистрация выполнена", "Добро пожаловать в сервис парковок!");
        formEl.reset();
        setPhone("");
        router.push("/profile");
        return; // не показываем никаких ошибок после успеха
      } else {
        const errorData = await res.json();
        console.log("Registration error response:", errorData);
        
        // Показываем детальную ошибку валидации
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((err: any) => err.message).join(", ");
          showError("Ошибка валидации", validationErrors);
        } else {
          showError("Ошибка регистрации", errorData.error || "Неизвестная ошибка");
        }
      }
    } catch (err: any) {
      // Не дублируем тосты при редких сбоях сети, просто логируем
      console.error("Register request failed", err);
    } finally {
      setLoading(false);
    }
  }

  function onPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    // If the very first character typed is 9, prepend 8 automatically
    if (/^\s*9/.test(value)) {
      value = "8" + value.trim();
    }
    setPhone(value);
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container max-w-md">
        <MotionCard className="w-full">
          <CardHeader 
            title="Создать аккаунт" 
            subtitle="Заполните форму для регистрации"
            icon="👤"
          />
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <Input
                name="name"
                label="Полное имя"
                placeholder="Иван Иванов"
                icon="👤"
                required
              />
              
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
                placeholder="Минимум 8 символов"
                icon="🔒"
                helperText="Пароль должен содержать минимум 8 символов"
                required
              />
              
              <Input
                name="phone"
                label="Телефон"
                placeholder="+7 (999) 123-45-67"
                icon="📱"
                required
                value={phone}
                onChange={onPhoneChange}
              />

              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  required
                  className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-surface)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)] focus:ring-2 mt-1"
                />
                <label className="text-sm text-[var(--text-secondary)]">
                  Я согласен с{" "}
                  <Link href="/terms" className="text-[var(--accent-primary)] hover:opacity-80 transition-colors duration-300">
                    условиями использования
                  </Link>{" "}
                  и{" "}
                  <Link href="/privacy" className="text-[var(--accent-primary)] hover:opacity-80 transition-colors duration-300">
                    политикой конфиденциальности
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full"
                icon="🚀"
              >
                {loading ? "Регистрация..." : "Зарегистрироваться"}
              </Button>
            </form>
          </CardContent>
          
          <div className="mt-6 pt-6 border-t border-[var(--border-primary)] text-center">
            <p className="text-[var(--text-secondary)] text-sm">
              Уже есть аккаунт?{" "}
              <Link 
                href="/login" 
                className="text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:opacity-80 transition-colors duration-300 font-medium"
              >
                Войти
              </Link>
            </p>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}


