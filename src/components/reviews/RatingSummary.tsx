"use client";

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export function RatingSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
}: RatingSummaryProps) {
  const percentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const positivePercentage = percentage(
    (ratingDistribution[5] || 0) + (ratingDistribution[4] || 0)
  );

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Средний рейтинг */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-[var(--text-primary)] mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`text-2xl ${
                  index < Math.round(averageRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ⭐
              </span>
            ))}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {totalReviews} {totalReviews === 1 ? "отзыв" : totalReviews < 5 ? "отзыва" : "отзывов"}
          </p>
          {positivePercentage > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {positivePercentage}% положительных отзывов
            </p>
          )}
        </div>

        {/* Распределение рейтингов */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percent = percentage(count);

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {rating}
                  </span>
                  <span className="text-yellow-400">⭐</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-sm text-[var(--text-secondary)] w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

