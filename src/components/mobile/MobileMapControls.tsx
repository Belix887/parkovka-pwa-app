"use client";
import { useState } from "react";

interface MobileMapControlsProps {
  spots: any[];
  onSpotSelect: (spot: any) => void;
  selectedSpot: any;
  setSelectedSpot?: (spot: any) => void;
  formatPrice?: (price: number) => string;
  getFeatures?: (spot: any) => string[];
}

export function MobileMapControls({ spots, onSpotSelect, selectedSpot }: MobileMapControlsProps) {
  const [showList, setShowList] = useState(false);

  const formatPrice = (price: number) => {
    return `${(price / 100).toLocaleString('ru-RU')} ₽/час`;
  };

  const getFeatureCount = (spot: any) => {
    let count = 0;
    if (spot.covered) count++;
    if (spot.guarded) count++;
    if (spot.camera) count++;
    if (spot.evCharging) count++;
    if (spot.disabledAccessible) count++;
    if (spot.wideEntrance) count++;
    return count;
  };

  return (
    <div className="mobile-map-controls">
      {/* Кнопка списка */}
      <button 
        className={`list-toggle ${showList ? 'active' : ''}`}
        onClick={() => setShowList(!showList)}
      >
        <span className="toggle-icon">📋</span>
        <span className="toggle-text">Список</span>
        <span className="spots-count">{spots.length}</span>
      </button>

      {/* Список парковок */}
      {showList && (
        <div className="spots-list-panel">
          <div className="panel-header">
            <h3 className="panel-title">Парковки на карте</h3>
            <button 
              className="close-list"
              onClick={() => setShowList(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="spots-scroll">
            {spots.map(spot => (
              <button
                key={spot.id}
                className={`spot-item ${selectedSpot?.id === spot.id ? 'selected' : ''}`}
                onClick={() => onSpotSelect(spot)}
              >
                <div className="spot-info">
                  <h4 className="spot-name">{spot.title}</h4>
                  <p className="spot-address">{spot.address}</p>
                  <div className="spot-meta">
                    <span className="spot-price">{formatPrice(spot.pricePerHour)}</span>
                    <span className="spot-features">
                      {getFeatureCount(spot)} особенностей
                    </span>
                  </div>
                </div>
                
                <div className="spot-arrow">
                  <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Статистика */}
      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-icon">📍</span>
          <span className="stat-text">{spots.length} мест</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💰</span>
          <span className="stat-text">от {Math.min(...spots.map(s => s.pricePerHour / 100))}₽</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🛡️</span>
          <span className="stat-text">Охрана</span>
        </div>
      </div>
    </div>
  );
}
