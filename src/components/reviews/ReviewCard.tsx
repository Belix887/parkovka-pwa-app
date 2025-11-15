"use client";
import { useState } from "react";
import { RatingStars } from "./RatingStars";
import { OwnerResponseForm } from "./OwnerResponseForm";
import { format } from "date-fns";

interface ReviewCardProps {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  ownerResponse?: string | null;
  ownerResponseAt?: string | null;
  helpfulCount: number;
  createdAt: string;
  renter: {
    id: string;
    name: string | null;
  };
  photos?: { url: string }[];
  spotOwnerId?: string;
  currentUserId?: string;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onResponseAdded?: () => void;
}

export function ReviewCard({
  id,
  rating,
  title,
  comment,
  ownerResponse,
  ownerResponseAt,
  helpfulCount,
  createdAt,
  renter,
  photos = [],
  spotOwnerId,
  currentUserId,
  onHelpful,
  onReport,
  onResponseAdded,
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const formattedDate = format(new Date(createdAt), "d MMMM yyyy");
  const isOwner = spotOwnerId && currentUserId && spotOwnerId === currentUserId;

  return (
    <div className="border border-[var(--border-primary)] rounded-lg p-4 md:p-6 bg-[var(--bg-surface)]">
      {/* Заголовок отзыва */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
              {renter.name ? renter.name.charAt(0).toUpperCase() : "А"}
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                {renter.name || "Анонимный пользователь"}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">{formattedDate}</p>
            </div>
          </div>
          <RatingStars rating={rating} size="sm" />
        </div>
      </div>

      {/* Заголовок и текст отзыва */}
      {title && (
        <h4 className="font-semibold text-lg text-[var(--text-primary)] mb-2">
          {title}
        </h4>
      )}
      <p className="text-[var(--text-secondary)] leading-relaxed mb-3 whitespace-pre-wrap">
        {comment}
      </p>

      {/* Фотографии */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo.url}
              alt={`Фото отзыва ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border border-[var(--border-primary)] cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                // TODO: Открыть галерею
                window.open(photo.url, "_blank");
              }}
            />
          ))}
        </div>
      )}

      {/* Ответ владельца */}
      {ownerResponse ? (
        <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">👤</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                Ответ владельца
                {ownerResponseAt && (
                  <span className="text-xs text-[var(--text-secondary)] ml-2">
                    {format(new Date(ownerResponseAt), "d MMM yyyy")}
                  </span>
                )}
              </p>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {ownerResponse}
              </p>
            </div>
          </div>
        </div>
      ) : isOwner && (
        <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
          {showResponseForm ? (
            <OwnerResponseForm
              reviewId={id}
              onSuccess={() => {
                setShowResponseForm(false);
                if (onResponseAdded) {
                  onResponseAdded();
                }
              }}
              onCancel={() => setShowResponseForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowResponseForm(true)}
              className="text-sm text-[var(--accent-primary)] hover:underline"
            >
              Ответить на отзыв
            </button>
          )}
        </div>
      )}

      {/* Действия */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border-primary)]">
        {onHelpful && (
          <button
            onClick={() => onHelpful(id)}
            className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors active:scale-95"
          >
            <span className="text-base">👍</span>
            <span>Полезно</span>
            {helpfulCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {helpfulCount}
              </span>
            )}
          </button>
        )}
        {onReport && (
          <button
            onClick={() => onReport(id)}
            className="text-sm text-[var(--text-secondary)] hover:text-red-500 transition-colors"
          >
            Пожаловаться
          </button>
        )}
      </div>
    </div>
  );
}

