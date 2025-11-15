"use client";
import { useState, useEffect } from "react";
import { ReviewCard } from "./ReviewCard";
import { RatingSummary } from "./RatingSummary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";

interface Review {
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
}

interface ReviewsListProps {
  spotId: string;
  spotOwnerId?: string;
  currentUserId?: string;
  onReviewCreated?: () => void;
}

export function ReviewsList({ spotId, spotOwnerId, currentUserId, onReviewCreated }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [statistics, setStatistics] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  useEffect(() => {
    loadReviews();
  }, [spotId, page, sort, ratingFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort,
      });
      if (ratingFilter) {
        params.append("rating", ratingFilter);
      }

      const response = await fetch(`/api/spots/${spotId}/reviews?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка загрузки отзывов");
      }

      if (page === 1) {
        setReviews(data.reviews || []);
      } else {
        setReviews((prev) => [...prev, ...(data.reviews || [])]);
      }

      setStatistics(data.statistics || statistics);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        // Обновляем локальное состояние
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? { ...review, helpfulCount: data.helpfulCount }
              : review
          )
        );
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  const handleReport = async (reviewId: string) => {
    // TODO: Реализовать жалобу
    console.log("Report review:", reviewId);
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика рейтингов */}
      {statistics.totalReviews > 0 && (
        <RatingSummary
          averageRating={statistics.averageRating}
          totalReviews={statistics.totalReviews}
          ratingDistribution={statistics.ratingDistribution}
        />
      )}

      {/* Фильтры и сортировка */}
      {statistics.totalReviews > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="highest">Высокий рейтинг</option>
            <option value="lowest">Низкий рейтинг</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="">Все рейтинги</option>
            <option value="5">5 звезд</option>
            <option value="4">4 звезды</option>
            <option value="3">3 звезды</option>
            <option value="2">2 звезды</option>
            <option value="1">1 звезда</option>
          </select>
        </div>
      )}

      {/* Список отзывов */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-[var(--text-secondary)]">
            Пока нет отзывов. Будьте первым!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                {...review}
                spotOwnerId={spotOwnerId}
                currentUserId={currentUserId}
                onHelpful={handleHelpful}
                onReport={handleReport}
                onResponseAdded={() => {
                  loadReviews();
                }}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                {loading ? "Загрузка..." : "Загрузить еще"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

