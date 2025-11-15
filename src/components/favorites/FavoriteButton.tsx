"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface FavoriteButtonProps {
  spotId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function FavoriteButton({
  spotId,
  className = "",
  size = "md",
  showText = false,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const { showSuccess, showError } = useToast();

  // Проверяем статус избранного при загрузке
  useEffect(() => {
    checkFavoriteStatus();
  }, [spotId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/${spotId}`);
      const data = await response.json();
      setIsFavorite(data.isFavorite || false);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (toggling) return;

    setToggling(true);
    const previousState = isFavorite;

    // Оптимистичное обновление UI
    setIsFavorite(!isFavorite);

    try {
      if (previousState) {
        // Удаляем из избранного
        const response = await fetch(`/api/favorites/${spotId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Ошибка удаления из избранного");
        }

        showSuccess("Удалено", "Место удалено из избранного");
      } else {
        // Добавляем в избранное
        const response = await fetch(`/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ spotId }),
        });

        if (!response.ok) {
          throw new Error("Ошибка добавления в избранное");
        }

        showSuccess("Добавлено", "Место добавлено в избранное");
      }
    } catch (error) {
      // Откатываем изменение при ошибке
      setIsFavorite(previousState);
      showError("Ошибка", "Не удалось изменить статус избранного");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <button
        className={`${className} opacity-50 cursor-not-allowed`}
        disabled
        aria-label="Загрузка..."
      >
        <span className="text-gray-400">❤️</span>
      </button>
    );
  }

  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={toggling}
      className={`
        ${className}
        ${toggling ? "opacity-50 cursor-wait" : "cursor-pointer"}
        transition-all duration-200
        hover:scale-110
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 rounded-full
      `}
      aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <span
        className={`
          ${sizeClasses[size]}
          ${isFavorite ? "text-red-500" : "text-gray-400"}
          transition-colors duration-200
          ${isFavorite ? "animate-pulse" : ""}
        `}
      >
        {isFavorite ? "❤️" : "🤍"}
      </span>
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isFavorite ? "В избранном" : "В избранное"}
        </span>
      )}
    </button>
  );
}

