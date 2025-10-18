"use client";
import { useState, useEffect } from "react";
import { MobileSpotCard } from "@/components/mobile/MobileSpotCard";
import { MobileFilters } from "@/components/mobile/MobileFilters";

interface ParkingSpot {
  id: string;
  title: string;
  address: string;
  pricePerHour: number;
  photos: { url: string }[];
  covered?: boolean;
  guarded?: boolean;
  camera?: boolean;
  evCharging?: boolean;
  disabledAccessible?: boolean;
  wideEntrance?: boolean;
}

export default function MobileAppCatalog() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: 150,
    features: [] as string[]
  });

  useEffect(() => {
    loadSpots();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [spots, filters]);

  const loadSpots = async () => {
    try {
      const response = await fetch('/api/spots/map');
      const data = await response.json();
      setSpots(data.spots || []);
    } catch (error) {
      console.error('Error loading spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = spots.filter(spot => {
      const priceInRubles = spot.pricePerHour / 100;
      
      if (priceInRubles > filters.priceRange) return false;
      
      if (filters.features.length > 0) {
        const spotFeatures: string[] = [];
        if (spot.covered) spotFeatures.push('Крытая');
        if (spot.guarded) spotFeatures.push('Охраняемая');
        if (spot.camera) spotFeatures.push('Камеры');
        if (spot.evCharging) spotFeatures.push('Зарядка ЭВ');
        if (spot.disabledAccessible) spotFeatures.push('Для инвалидов');
        if (spot.wideEntrance) spotFeatures.push('Широкий въезд');
        
        const hasAllFeatures = filters.features.every(feature => 
          spotFeatures.includes(feature)
        );
        if (!hasAllFeatures) return false;
      }
      
      return true;
    });
    
    setFilteredSpots(filtered);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="mobile-catalog-app">
      {/* Заголовок с фильтрами */}
      <div className="catalog-header">
        <div className="header-content">
          <h1 className="page-title">Каталог парковок</h1>
          <p className="page-subtitle">Найдено: {filteredSpots.length} парковок</p>
        </div>
        
        <button 
          className="filters-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="filter-icon">🔍</span>
          <span className="filter-text">Фильтры</span>
        </button>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="filters-panel">
          <MobileFilters 
            filters={filters}
            onChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Список парковок */}
      <div className="catalog-content">
        {loading ? (
          <div className="loading-spots">
            <div className="loading-card"></div>
            <div className="loading-card"></div>
            <div className="loading-card"></div>
          </div>
        ) : filteredSpots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">Парковки не найдены</h3>
            <p className="empty-subtitle">
              Попробуйте изменить параметры фильтрации
            </p>
            <button 
              className="reset-filters-btn"
              onClick={() => setFilters({ priceRange: 150, features: [] })}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="spots-list">
            {filteredSpots.map(spot => (
              <MobileSpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
