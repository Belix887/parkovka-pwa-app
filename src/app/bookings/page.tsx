"use client";

import { useState, useEffect } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { format, parseISO } from "date-fns";
import Link from "next/link";

interface Booking {
  id: string;
  spotId: string;
  spot: {
    id: string;
    title: string;
    address: string;
    pricePerHour: number;
  };
  startAt: string;
  endAt: string;
  status: string;
  totalPrice: number;
  routeDistance?: number;
  routeDuration?: number;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      if (!response.ok) {
        throw new Error("Не удалось загрузить бронирования");
      }
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" | "default" }> = {
      PENDING: { label: "Ожидает", variant: "warning" },
      APPROVED: { label: "Подтверждено", variant: "info" },
      PAID: { label: "Оплачено", variant: "success" },
      DECLINED: { label: "Отклонено", variant: "error" },
      CANCELLED: { label: "Отменено", variant: "default" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return `${(price / 100).toLocaleString("ru-RU")} ₽`;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return "—";
    if (meters < 1000) return `${Math.round(meters)} м`;
    return `${(meters / 1000).toFixed(1)} км`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ч ${remainingMinutes} мин`;
  };

  const canCancelBooking = (booking: Booking) => {
    return (
      (booking.status === "PENDING" ||
        booking.status === "APPROVED" ||
        booking.status === "PAID") &&
      new Date(booking.endAt) > new Date()
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.spot.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingBookings = filteredBookings.filter(
    (b) => new Date(b.endAt) > new Date() && (b.status === "APPROVED" || b.status === "PAID")
  );
  const pastBookings = filteredBookings.filter((b) => new Date(b.endAt) <= new Date());
  const pendingBookings = filteredBookings.filter((b) => b.status === "PENDING");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
        <MobileNavigation />
        <div className="pt-14 md:pt-0">
          <div className="container py-12">
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
      <MobileNavigation />
      <div className="pt-14 md:pt-0">
        <div className="container py-6 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Мои бронирования
            </h1>
            <p className="text-[var(--text-secondary)] text-base md:text-lg">
              Управляйте своими бронированиями парковочных мест
            </p>
          </div>

          {/* Фильтры и поиск */}
          <MotionCard className="mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                <Input
                  placeholder="Поиск по названию или адресу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon="🔍"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === "all" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Все
                  </Button>
                  <Button
                    variant={statusFilter === "PENDING" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("PENDING")}
                  >
                    Ожидают
                  </Button>
                  <Button
                    variant={statusFilter === "APPROVED" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("APPROVED")}
                  >
                    Подтверждены
                  </Button>
                  <Button
                    variant={statusFilter === "PAID" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("PAID")}
                  >
                    Оплачены
                  </Button>
                </div>
              </div>
            </CardContent>
          </MotionCard>

          {error && (
            <MotionCard className="mb-6 bg-red-50 border-red-200">
              <CardContent className="p-4">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </MotionCard>
          )}

          {/* Предстоящие бронирования */}
          {upcomingBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">
                Предстоящие ({upcomingBookings.length})
              </h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}

          {/* Ожидающие подтверждения */}
          {pendingBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">
                Ожидают подтверждения ({pendingBookings.length})
              </h2>
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}

          {/* Прошлые бронирования */}
          {pastBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">
                История ({pastBookings.length})
              </h2>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}

          {filteredBookings.length === 0 && (
            <MotionCard>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Нет бронирований
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Попробуйте изменить фильтры"
                    : "Начните бронировать парковочные места"}
                </p>
                <Link href="/catalog">
                  <Button variant="primary" icon="🚗">
                    Найти парковку
                  </Button>
                </Link>
              </CardContent>
            </MotionCard>
          )}
        </div>
      </div>
    </div>
  );

  function BookingCard({ booking }: { booking: Booking }) {
    return (
      <MotionCard>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <Link href={`/spots/${booking.spotId}`}>
                  <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors">
                    {booking.spot.title}
                  </h3>
                </Link>
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                📍 {booking.spot.address}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                <span>
                  📅 {format(parseISO(booking.startAt), "d MMM yyyy, HH:mm")} —{" "}
                  {format(parseISO(booking.endAt), "HH:mm")}
                </span>
                {booking.routeDistance && (
                  <span>📍 {formatDistance(booking.routeDistance)}</span>
                )}
                {booking.routeDuration && (
                  <span>⏱️ {formatDuration(booking.routeDuration)}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-xl font-bold text-[var(--accent-primary)]">
                {formatPrice(booking.totalPrice)}
              </div>
              <div className="flex gap-2">
                <Link href={`/bookings/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    Детали
                  </Button>
                </Link>
                {canCancelBooking(booking) && (
                  <Link href={`/bookings/${booking.id}`}>
                    <Button variant="ghost" size="sm" icon="❌">
                      Отменить
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </MotionCard>
    );
  }
}

