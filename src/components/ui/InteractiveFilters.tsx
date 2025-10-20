"use client";
import { useState, useEffect } from "react";
import { RangeSlider } from "./RangeSlider";
import { useRouter, useSearchParams } from "next/navigation";

export function InteractiveFilters() {
  const router = useRouter();
  const search = useSearchParams();
  const [priceRange, setPriceRange] = useState<number>(Number(search.get("priceMax")) || 150);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    const raw = search.get("features");
    return raw ? raw.split(",") : [];
  });

  const features = [
    { id: 'covered', label: 'Крытая', icon: '🏠', color: 'bg-[var(--accent-primary)]' },
    { id: 'guarded', label: 'Охраняемая', icon: '🛡️', color: 'bg-[var(--accent-success)]' },
    { id: 'camera', label: 'Камера', icon: '📹', color: 'bg-[var(--accent-warning)]' },
    { id: 'evCharging', label: 'Зарядка ЭВ', icon: '⚡', color: 'bg-[var(--accent-warning)]' },
    { id: 'disabledAccessible', label: 'Для инвалидов', icon: '♿', color: 'bg-[var(--accent-success)]' },
    { id: 'wideEntrance', label: 'Широкий въезд', icon: '🚗', color: 'bg-[var(--accent-primary)]' },
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(search.toString());
    params.set("priceMax", String(priceRange * 100)); // копейки
    if (selectedFeatures.length) params.set("features", selectedFeatures.join(","));
    else params.delete("features");
    router.push(`?${params.toString()}`);
  }, [priceRange, selectedFeatures]);

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

      {/* Особенности */}
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
      </div>
    </div>
  );
}
