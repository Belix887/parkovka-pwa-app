"use client";
import { useState } from "react";

interface MobileFiltersProps {
  filters: {
    priceRange: number;
    features: string[];
  };
  onChange: (filters: any) => void;
  onClose: () => void;
}

export function MobileFilters({ filters, onChange, onClose }: MobileFiltersProps) {
  const availableFeatures = [
    { key: 'Крытая', icon: '🏠' },
    { key: 'Охраняемая', icon: '🛡️' },
    { key: 'Камеры', icon: '📹' },
    { key: 'Зарядка ЭВ', icon: '⚡' },
    { key: 'Для инвалидов', icon: '♿' },
    { key: 'Широкий въезд', icon: '🚗' }
  ];

  const handlePriceChange = (price: number) => {
    onChange({ ...filters, priceRange: price });
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    
    onChange({ ...filters, features: newFeatures });
  };

  const resetFilters = () => {
    onChange({ priceRange: 150, features: [] });
  };

  return (
    <div className="mobile-filters">
      <div className="filters-header">
        <h3 className="filters-title">Фильтры</h3>
        <button className="filters-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="filters-content">
        {/* Фильтр по цене */}
        <div className="filter-section">
          <h4 className="filter-section-title">
            <span className="section-icon">💰</span>
            Максимальная цена
          </h4>
          <div className="price-filter">
            <div className="price-display">
              <span className="price-value">{filters.priceRange} ₽/час</span>
            </div>
            <div className="price-slider-container">
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={filters.priceRange}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="price-slider"
              />
              <div className="slider-labels">
                <span>50₽</span>
                <span>300₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Фильтр по особенностям */}
        <div className="filter-section">
          <h4 className="filter-section-title">
            <span className="section-icon">✨</span>
            Особенности
          </h4>
          <div className="features-grid">
            {availableFeatures.map(feature => (
              <button
                key={feature.key}
                className={`feature-chip ${filters.features.includes(feature.key) ? 'active' : ''}`}
                onClick={() => handleFeatureToggle(feature.key)}
              >
                <span className="chip-icon">{feature.icon}</span>
                <span className="chip-text">{feature.key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="filters-footer">
        <button className="reset-btn" onClick={resetFilters}>
          Сбросить
        </button>
        <button className="apply-btn" onClick={onClose}>
          Применить
        </button>
      </div>
    </div>
  );
}
