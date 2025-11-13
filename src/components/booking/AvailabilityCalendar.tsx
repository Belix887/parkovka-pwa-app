"use client";

import { useState, useEffect } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";

interface AvailableSlot {
  start: string;
  end: string;
}

interface AvailabilityCalendarProps {
  spotId: string;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
}

export function AvailabilityCalendar({
  spotId,
  onDateSelect,
  selectedDate,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, AvailableSlot[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем доступность для текущего месяца
  useEffect(() => {
    loadMonthAvailability();
  }, [currentMonth, spotId]);

  const loadMonthAvailability = async () => {
    setLoading(true);
    setError(null);

    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start, end });

      const promises = days.map(async (day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        try {
          const response = await fetch(
            `/api/spots/${spotId}/availability?date=${dateStr}`
          );
          if (!response.ok) throw new Error("Failed to fetch");
          const data = await response.json();
          return { date: dateStr, slots: data.availableSlots };
        } catch {
          return { date: dateStr, slots: [] };
        }
      });

      const results = await Promise.all(promises);
      const availabilityMap: Record<string, AvailableSlot[]> = {};
      results.forEach(({ date, slots }) => {
        availabilityMap[date] = slots;
      });

      setAvailability(availabilityMap);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки доступности");
    } finally {
      setLoading(false);
    }
  };

  const getDayStatus = (date: Date): "available" | "busy" | "partial" | "unknown" => {
    const dateStr = format(date, "yyyy-MM-dd");
    const slots = availability[dateStr];

    if (!slots || slots.length === 0) {
      return loading ? "unknown" : "busy";
    }

    // Если есть свободные слоты, проверяем, покрывают ли они весь день
    const totalMinutes = slots.reduce(
      (sum, slot) => sum + (new Date(slot.end).getTime() - new Date(slot.start).getTime()) / (1000 * 60),
      0
    );

    if (totalMinutes >= 24 * 60 * 0.8) {
      // 80% дня свободно
      return "available";
    } else if (totalMinutes > 0) {
      return "partial";
    }

    return "busy";
  };

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Добавляем дни предыдущего месяца для заполнения недели
  const firstDay = startOfMonth(currentMonth);
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Понедельник = 0
  const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(firstDay);
    date.setDate(date.getDate() - firstDayOfWeek + i);
    return date;
  });

  // Добавляем дни следующего месяца для заполнения недели
  const lastDay = endOfMonth(currentMonth);
  const lastDayOfWeek = lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1;
  const nextMonthDays = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
    const date = new Date(lastDay);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...prevMonthDays, ...days, ...nextMonthDays];

  return (
    <MotionCard>
      <CardHeader
        title="Календарь доступности"
        subtitle="Выберите дату для бронирования"
        icon="📅"
      />
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Навигация по месяцам */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {format(currentMonth, "LLLL yyyy")}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-[var(--text-secondary)] py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Календарная сетка */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isToday = isSameDay(date, new Date());
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const status = getDayStatus(date);

              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && handleDateClick(date)}
                  disabled={!isCurrentMonth || status === "busy"}
                  className={`
                    aspect-square p-2 rounded-lg text-sm font-medium transition-all
                    ${!isCurrentMonth ? "text-[var(--text-muted)] opacity-30" : ""}
                    ${isToday ? "ring-2 ring-[var(--accent-primary)]" : ""}
                    ${isSelected ? "bg-[var(--accent-primary)] text-white" : ""}
                    ${
                      status === "available"
                        ? "bg-green-100 hover:bg-green-200 text-green-800"
                        : status === "partial"
                        ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                        : status === "busy"
                        ? "bg-red-100 text-red-600 cursor-not-allowed opacity-50"
                        : "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)]"
                    }
                  `}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>

          {/* Легенда */}
          <div className="flex items-center justify-center gap-4 text-xs pt-4 border-t border-[var(--border-primary)]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100"></div>
              <span className="text-[var(--text-secondary)]">Свободно</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100"></div>
              <span className="text-[var(--text-secondary)]">Частично</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100"></div>
              <span className="text-[var(--text-secondary)]">Занято</span>
            </div>
          </div>
        </div>
      </CardContent>
    </MotionCard>
  );
}

