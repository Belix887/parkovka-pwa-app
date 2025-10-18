"use client";
import Link from "next/link";

interface MobileSpotCardProps {
  spot: {
    id: string;
    title: string;
    address: string;
    pricePerHour: number;
    photos?: { url: string }[];
    covered?: boolean;
    guarded?: boolean;
    camera?: boolean;
    evCharging?: boolean;
    disabledAccessible?: boolean;
    wideEntrance?: boolean;
  };
}

export function MobileSpotCard({ spot }: MobileSpotCardProps) {
  const formatPrice = (price: number) => {
    return `${(price / 100).toLocaleString('ru-RU')} ₽/час`;
  };

  const getFeatures = () => {
    const features = [];
    if (spot.covered) features.push('🏠');
    if (spot.guarded) features.push('🛡️');
    if (spot.camera) features.push('📹');
    if (spot.evCharging) features.push('⚡');
    if (spot.disabledAccessible) features.push('♿');
    if (spot.wideEntrance) features.push('🚗');
    return features.slice(0, 3); // Показываем только первые 3
  };

  return (
    <Link href={`/mobile/spots/${spot.id}`} className="mobile-spot-card">
      <div className="spot-image">
        {spot.photos && spot.photos.length > 0 ? (
          <img 
            src={spot.photos[0].url} 
            alt={spot.title}
            className="spot-photo"
          />
        ) : (
          <div className="spot-placeholder">
            <span className="placeholder-icon">🚗</span>
          </div>
        )}
        <div className="spot-price">
          {formatPrice(spot.pricePerHour)}
        </div>
      </div>
      
      <div className="spot-content">
        <h3 className="spot-title">{spot.title}</h3>
        <p className="spot-address">
          <span className="address-icon">📍</span>
          {spot.address}
        </p>
        
        {getFeatures().length > 0 && (
          <div className="spot-features">
            {getFeatures().map((feature, index) => (
              <span key={index} className="feature-icon">
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="spot-action">
        <span className="action-icon">👁️</span>
      </div>
    </Link>
  );
}
