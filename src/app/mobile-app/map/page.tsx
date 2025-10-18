"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileMapControls } from "@/components/mobile/MobileMapControls";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

interface ParkingSpot {
  id: string;
  title: string;
  address: string;
  pricePerHour: number;
  geoLat: number;
  geoLng: number;
  covered: boolean;
  guarded: boolean;
  camera: boolean;
  evCharging: boolean;
  disabledAccessible: boolean;
  wideEntrance: boolean;
  photos: { url: string }[];
}

export default function MobileAppMapPage() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spots/map');
      const data = await response.json();
      setSpots(data.spots || []);
    } catch (error) {
      console.error('Error loading parking spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 100).toLocaleString('ru-RU')} ₽/час`;
  };

  const getFeatures = (spot: ParkingSpot) => {
    const features = [];
    if (spot.covered) features.push('Крытая');
    if (spot.guarded) features.push('Охраняемая');
    if (spot.camera) features.push('Камеры');
    if (spot.evCharging) features.push('Зарядка ЭВ');
    if (spot.disabledAccessible) features.push('Для инвалидов');
    if (spot.wideEntrance) features.push('Широкий въезд');
    return features;
  };

  return (
    <div className="mobile-map-app">
      {/* Заголовок карты */}
      <div className="map-header-app">
        <div className="header-content">
          <h1 className="page-title">Карта парковок</h1>
          <p className="page-subtitle">Доступно: {spots.length} мест</p>
        </div>
        <Link href="/mobile-app/catalog" className="catalog-link">
          <span className="link-icon">🚗</span>
          Каталог
        </Link>
      </div>

      {/* Контейнер карты */}
      <div className="map-container-app">
        {loading && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка парковок...</p>
          </div>
        )}
        <LeafletMap spots={spots} center={[55.751244, 37.618423]} />
      </div>

      {/* Элементы управления картой */}
      <MobileMapControls
        spots={spots}
        selectedSpot={selectedSpot}
        onSpotSelect={setSelectedSpot}
        setSelectedSpot={setSelectedSpot}
        formatPrice={formatPrice}
        getFeatures={getFeatures}
      />

      {/* Информационная панель */}
      {selectedSpot && (
        <div className="spot-info-panel-app">
          <div className="panel-header">
            <h3 className="spot-title">{selectedSpot.title}</h3>
            <button className="close-panel" onClick={() => setSelectedSpot(null)}>
              ✕
            </button>
          </div>
          <div className="panel-content">
            <div className="spot-details">
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <span className="detail-text">{selectedSpot.address}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">💰</span>
                <span className="detail-text">{formatPrice(selectedSpot.pricePerHour)}</span>
              </div>
              {selectedSpot.photos.length > 0 && (
                <div className="spot-photo">
                  <img src={selectedSpot.photos[0].url} alt={selectedSpot.title} className="photo-image" />
                </div>
              )}
              <div className="detail-item">
                <span className="detail-icon">✨</span>
                <div className="features-list">
                  {getFeatures(selectedSpot).map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="panel-actions">
              <Link href={`/spots/${selectedSpot.id}`} className="action-button primary">
                <span className="button-icon">👁️</span>
                Подробнее
              </Link>
              <button className="action-button secondary">
                <span className="button-icon">❤️</span>
                В избранное
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
