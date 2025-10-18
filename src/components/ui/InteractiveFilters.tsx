"use client";
import { useState } from "react";
import { RangeSlider } from "./RangeSlider";

export function InteractiveFilters() {
  const [priceRange, setPriceRange] = useState(150);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const features = [
    { id: 'covered', label: 'Крытая', icon: '🏠', color: 'bg-[var(--accent-primary)]' },
    { id: 'guarded', label: 'Охраняемая', icon: '🛡️', color: 'bg-[var(--accent-success)]' },
    { id: 'charging', label: 'Электрозарядка', icon: '🔌', color: 'bg-[var(--accent-warning)]' }
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const getPriceCategory = (price: number) => {
    if (price < 100) return 'Бюджетные';
    if (price < 200) return 'Средние';
    if (price < 350) return 'Премиум';
    return 'Люкс';
  };

  const getPriceColor = (price: number) => {
    if (price < 100) return 'bg-green-500';
    if (price < 200) return 'bg-blue-500';
    if (price < 350) return 'bg-purple-500';
    return 'bg-red-500';
  };


  return (
    <div className="space-y-6">
      {/* Цена за час */}
      <div>
        <label className="block text-sm font-bold text-[var(--text-primary)] mb-3 drop-shadow-sm">
          Цена за час: {priceRange}₽
        </label>
        <div className="space-y-3">
          <RangeSlider
            min={50}
            max={500}
            value={priceRange}
            onChange={setPriceRange}
            step={10}
            className="h-3"
          />
          <div className="flex justify-between text-sm text-[var(--text-primary)] font-medium">
            <span>50₽</span>
            <span className={`px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg ${getPriceColor(priceRange)}`}>
              {getPriceCategory(priceRange)}
            </span>
            <span>500₽</span>
          </div>
        </div>
      </div>

      {/* Размер места */}
      <div>
        <label className="block text-sm font-bold text-[var(--text-primary)] mb-3 drop-shadow-sm">
          Размер места
        </label>
        <select className="w-full p-3 bg-[var(--bg-tertiary)] border-2 border-[var(--accent-primary)] rounded-xl text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
          <option>Любой</option>
          <option>Компактный</option>
          <option>Стандартный</option>
          <option>Большой</option>
        </select>
      </div>

      {/* Интерактивные кнопки особенностей */}
      <div>
        <label className="block text-sm font-bold text-[var(--text-primary)] mb-3 drop-shadow-sm">
          Особенности места
        </label>
        <div className="flex flex-wrap gap-3">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                selectedFeatures.includes(feature.id)
                  ? `${feature.color} text-white transform scale-105`
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-2 border-[var(--border-primary)] hover:border-[var(--accent-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{feature.icon}</span>
                {feature.label}
              </span>
            </button>
          ))}
        </div>
        
        {/* Показываем выбранные особенности */}
        {selectedFeatures.length > 0 && (
          <div className="mt-4 p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--accent-primary)]">
            <p className="text-sm text-[var(--text-primary)] font-medium mb-2">
              Выбрано особенностей: {selectedFeatures.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedFeatures.map(featureId => {
                const feature = features.find(f => f.id === featureId);
                return (
                  <span key={featureId} className="px-2 py-1 bg-[var(--accent-primary)] text-white rounded-full text-xs">
                    {feature?.icon} {feature?.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Результаты фильтрации */}
      <div className="p-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl">
        <h4 className="text-white font-bold mb-2">Результаты поиска</h4>
        <p className="text-white text-sm opacity-90">
          Найдено мест: {Math.floor(Math.random() * 50) + 10} в диапазоне {priceRange}₽/час
        </p>
        {selectedFeatures.length > 0 && (
          <p className="text-white text-sm opacity-90 mt-1">
            С особенностями: {selectedFeatures.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
