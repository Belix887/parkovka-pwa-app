import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Load user-related data (works with real Prisma and the in-memory mock)
  const now = new Date();
  const [mySpots, bookingsAsRenter, bookingsAsOwner] = await Promise.all([
    prisma.parkingSpot.findMany({ where: { ownerId: user.id } }),
    // bookings made by the user
    (prisma as any).booking.findMany({ where: { renterId: user.id }, include: { spot: true } }),
    // bookings for user's spots (to calculate earnings)
    (prisma as any).booking.findMany({ where: { spot: { ownerId: user.id } }, include: { spot: true } }),
  ]);

  const activeBookingsCount = bookingsAsRenter.filter(
    (b: any) => b.endAt > now && (b.status === "APPROVED" || b.status === "PAID")
  ).length;

  const earnings = bookingsAsOwner
    .filter((b: any) => b.status === "PAID" || b.status === "APPROVED")
    .reduce((sum: number, b: any) => sum + (b.ownerAmount ?? 0), 0);

  const formatRub = (amount: number) => `${(amount / 100).toLocaleString("ru-RU")} ₽`;

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Мой профиль
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Управляйте своими парковочными местами и бронированиями
          </p>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Мои места"
            value={String(mySpots.length)}
            icon="🅿️"
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Активные бронирования"
            value={String(activeBookingsCount)}
            icon="📅"
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Заработано"
            value={formatRub(earnings)}
            icon="💰"
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Рейтинг"
            value="—"
            icon="⭐"
            trend={{ value: 0, isPositive: true }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Информация о пользователе */}
          <MotionCard>
            <CardHeader 
              title="Личная информация" 
              subtitle="Основные данные профиля"
              icon="👤"
            />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Имя
                  </label>
                  <p className="text-[var(--text-secondary)]">{user.name || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Email
                  </label>
                  <p className="text-[var(--text-secondary)]">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Телефон
                  </label>
                  <p className="text-[var(--text-secondary)]">{user.phone || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Статус
                  </label>
                  <Badge variant="success">Верифицирован</Badge>
                </div>
              </div>
            </CardContent>
            <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
              <Link href="/profile/edit" className="block">
                <Button variant="outline" size="sm" className="w-full" icon="✏️">
                  Редактировать профиль
                </Button>
              </Link>
            </div>
          </MotionCard>

          {/* Мои парковочные места */}
          <MotionCard>
            <CardHeader 
              title="Мои места" 
              subtitle="Управление парковочными местами"
              icon="🅿️"
            />
            <CardContent>
              <div className="space-y-4">
                {mySpots.length === 0 && (
                  <p className="text-[var(--text-secondary)]">У вас пока нет парковочных мест.</p>
                )}
                {mySpots.slice(0, 3).map((s: any) => (
                  <div key={s.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[var(--text-primary)]">
                        {s.title}
                      </h4>
                      <Badge variant={s.status === "APPROVED" ? "success" : s.status === "PENDING_REVIEW" ? "warning" : "default"} size="sm">
                        {s.status === "APPROVED" ? "Активно" : s.status === "PENDING_REVIEW" ? "На модерации" : "Черновик"}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      {s.address}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">
                        {(s.pricePerHour / 100).toLocaleString("ru-RU")} ₽/час
                      </span>
                      <Link href={`/spots/${s.id}`}>
                        <Button variant="ghost" size="sm" icon="👁️">
                          Просмотр
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
              <Link href="/spots/create" className="block">
                <Button variant="primary" size="sm" className="w-full" icon="➕">
                  Добавить место
                </Button>
              </Link>
            </div>
          </MotionCard>

          {/* Последние бронирования */}
          <MotionCard>
            <CardHeader 
              title="Бронирования" 
              subtitle="История аренды"
              icon="📅"
            />
            <CardContent>
              <div className="space-y-4">
                {bookingsAsRenter.length === 0 && (
                  <p className="text-[var(--text-secondary)]">Нет бронирований.</p>
                )}
                {bookingsAsRenter.slice(0, 3).map((b: any) => (
                  <div key={b.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[var(--text-primary)]">
                        {b.spot?.title || "Парковка"}
                      </h4>
                      <Badge variant={b.status === "PAID" ? "success" : b.status === "APPROVED" ? "info" : b.status === "PENDING" ? "warning" : "default"} size="sm">
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      {new Date(b.startAt).toLocaleString("ru-RU")} — {new Date(b.endAt).toLocaleString("ru-RU")}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">
                        {formatRub(b.totalPrice)}
                      </span>
                      <Button variant="ghost" size="sm" icon="👁️">
                        Детали
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
              <Button variant="outline" size="sm" className="w-full" icon="📋">
                Все бронирования
              </Button>
            </div>
          </MotionCard>
        </div>
      </div>
    </div>
  );
}


