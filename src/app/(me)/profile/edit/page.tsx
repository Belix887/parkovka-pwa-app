"use client";
import { useEffect, useState } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ProfileEditPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/me", { cache: "no-store" });
      if (r.ok) {
        const me = await r.json();
        setName(me.name || "");
        setPhone(me.phone || "");
      } else if (r.status === 401) {
        router.push("/login");
      }
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
      if (r.ok) {
        router.push("/profile");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container max-w-xl">
        <MotionCard>
          <CardHeader title="Редактировать профиль" subtitle="Обновите личные данные" icon="✏️" />
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <Input label="Имя" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
              <Input label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7..." />
              <Button type="submit" variant="primary" loading={loading} className="w-full">Сохранить</Button>
            </form>
          </CardContent>
        </MotionCard>
      </div>
    </main>
  );
}


