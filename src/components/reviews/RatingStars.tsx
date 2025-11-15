"use client";
import { useState } from "react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className = "",
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={() => setHoveredRating(0)}
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1;
        const isFilled = value <= displayRating;
        const isHovered = interactive && value <= hoveredRating;

        return (
          <button
            key={value}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoveredRating(value)}
            className={`
              ${sizeClasses[size]}
              ${interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
              ${isFilled ? "text-yellow-400" : "text-gray-300"}
              ${isHovered ? "scale-110" : ""}
              transition-all duration-150
            `}
            aria-label={`Оценка ${value} из ${maxRating}`}
          >
            ⭐
          </button>
        );
      })}
      {!interactive && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

