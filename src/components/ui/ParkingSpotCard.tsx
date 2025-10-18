"use client";
import { MotionCard, CardHeader, CardContent, CardFooter } from "./MotionCard";
import { Badge } from "./Badge";
import { Button } from "./Button";
import Link from "next/link";

interface ParkingSpotCardProps {
  id: string;
  title: string;
  description: string;
  pricePerHour: number;
  address: string;
  features: string[];
  photos: string[];
  className?: string;
}

export function ParkingSpotCard({
  id,
  title,
  description,
  pricePerHour,
  address,
  features,
  photos,
  className = ""
}: ParkingSpotCardProps) {
  const formatPrice = (price: number) => {
    return `${(price / 100).toLocaleString('ru-RU')} ₽/час`;
  };

  const getFeatureIcon = (feature: string) => {
    const icons: { [key: string]: string } = {
      'Крытая': '🏠',
      'Охраняемая': '🛡️',
      'Камеры': '📹',
      'Зарядка ЭВ': '⚡',
      'Для инвалидов': '♿',
      'Широкий въезд': '🚗'
    };
    return icons[feature] || '✅';
  };

  return (
    <MotionCard className={`overflow-hidden hover:shadow-2xl transition-all duration-300 ${className}`}>
      {/* Заголовок с ценой */}
      <div className="p-6 pb-4 border-b border-[var(--border-primary)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-3">
              <span className="text-red-500">📍</span>
              <span className="text-sm font-medium">{address}</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
              {formatPrice(pricePerHour)}
            </div>
          </div>
        </div>
      </div>

      {/* Фото */}
      {photos.length > 0 && (
        <div className="relative h-56 overflow-hidden">
          <img 
            src={photos[0]} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}

      {/* Описание */}
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>

          {/* Особенности */}
          {features.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <span>✨</span>
                Особенности
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 bg-[var(--bg-tertiary)] rounded-lg"
                  >
                    <span className="text-lg">{getFeatureIcon(feature)}</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Кнопки действий */}
      <CardFooter className="p-6 pt-0">
        <div className="flex gap-3 w-full">
          <Button 
            variant="outline" 
            size="md" 
            className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
            icon="❤️"
          >
            В избранное
          </Button>
          <Link href={`/spots/${id}`} className="flex-1">
            <Button 
              variant="primary" 
              size="md" 
              className="w-full hover:shadow-lg transition-all duration-200"
              icon="👁️"
            >
              Подробнее
            </Button>
          </Link>
        </div>
      </CardFooter>
    </MotionCard>
  );
}
