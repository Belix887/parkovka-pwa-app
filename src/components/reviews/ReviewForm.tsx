"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "./RatingStars";
import { useToast } from "@/components/ui/ToastProvider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ReviewFormProps {
  spotId: string;
  bookingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ spotId, bookingId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { showSuccess, showError, showInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - photos.length;
    if (remainingSlots <= 0) {
      showError("Лимит", "Максимум 3 фотографии");
      e.currentTarget.value = "";
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setUploadingPhotos(true);

    for (const file of filesToProcess) {
      if (!file.type.startsWith("image/")) {
        showError("Некорректный файл", "Выберите изображение");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError("Файл слишком большой", "Максимальный размер: 5MB");
        continue;
      }

      try {
        const res = await fetch("/api/uploads/sign", { method: "POST" });
        if (!res.ok) throw new Error("Ошибка получения URL");

        const data = await res.json();
        if (data.signedUrl) {
          const uploadRes = await fetch(data.signedUrl, {
            method: data.method || "PUT",
            headers: data.headers || {},
            body: file,
          });

          if (!uploadRes.ok) throw new Error("Ошибка загрузки");

          setPhotos((p) => [...p, data.publicUrl]);
          showInfo("Фото добавлено", "Фотография успешно загружена");
        } else if (data.publicUrl) {
          setPhotos((p) => [...p, data.publicUrl]);
        } else {
          throw new Error("URL не получен");
        }
      } catch (err) {
        console.error("Ошибка загрузки фото:", err);
        showError("Ошибка загрузки", `Не удалось загрузить ${file.name}`);
      }
    }

    setUploadingPhotos(false);
    e.currentTarget.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Валидация
    if (rating === 0) {
      setErrors({ rating: "Выберите рейтинг" });
      return;
    }

    if (comment.trim().length < 10) {
      setErrors({ comment: "Комментарий должен содержать минимум 10 символов" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotId,
          bookingId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          photos: photos.length > 0 ? photos : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const newErrors: { [key: string]: string } = {};
          data.details.forEach((detail: { path: string; message: string }) => {
            newErrors[detail.path] = detail.message;
          });
          setErrors(newErrors);
        } else {
          showError("Ошибка", data.error || "Не удалось создать отзыв");
        }
        return;
      }

      showSuccess("Отзыв создан", "Ваш отзыв отправлен на модерацию");
      
      // Сброс формы
      setRating(0);
      setTitle("");
      setComment("");
      setPhotos([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating review:", error);
      showError("Ошибка", "Не удалось создать отзыв");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Рейтинг <span className="text-red-500">*</span>
        </label>
        <RatingStars
          rating={rating}
          interactive={true}
          onRatingChange={setRating}
          size="lg"
        />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Заголовок (необязательно)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Краткое описание вашего опыта"
          className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Комментарий <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          minLength={10}
          maxLength={2000}
          placeholder="Опишите ваш опыт использования парковочного места..."
          className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          {comment.length} / 2000 символов
        </p>
        {errors.comment && (
          <p className="mt-1 text-sm text-red-500">{errors.comment}</p>
        )}
      </div>

      {/* Загрузка фотографий */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Фотографии (необязательно, максимум 3)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          max={3}
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhotos || photos.length >= 3}
            icon="📷"
          >
            {uploadingPhotos ? "Загрузка..." : "Добавить фото"}
          </Button>
          {photos.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setPhotos([])}
              className="text-red-500 hover:text-red-700"
            >
              Очистить ({photos.length})
            </Button>
          )}
        </div>
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Фото ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-[var(--border-primary)]"
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.photos && (
          <p className="mt-1 text-sm text-red-500">{errors.photos}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={loading || rating === 0}
          className="flex-1"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Отправка...
            </>
          ) : (
            "Отправить отзыв"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}

