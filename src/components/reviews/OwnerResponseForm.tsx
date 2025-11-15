"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface OwnerResponseFormProps {
  reviewId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OwnerResponseForm({
  reviewId,
  onSuccess,
  onCancel,
}: OwnerResponseFormProps) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (response.trim().length < 1) {
      setError("Ответ не может быть пустым");
      return;
    }

    if (response.trim().length > 1000) {
      setError("Ответ не должен превышать 1000 символов");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: response.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка добавления ответа");
      }

      showSuccess("Ответ добавлен", "Ваш ответ успешно опубликован");
      setResponse("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Не удалось добавить ответ");
      showError("Ошибка", err.message || "Не удалось добавить ответ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Ваш ответ на отзыв
        </label>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Напишите ответ на отзыв пользователя..."
          className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          {response.length} / 1000 символов
        </p>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={loading || response.trim().length === 0}
          className="flex-1"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Отправка...
            </>
          ) : (
            "Отправить ответ"
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

