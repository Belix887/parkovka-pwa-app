"use client";
import { useState, useRef, useEffect } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  className?: string;
}

export function RangeSlider({ min, max, value, onChange, step = 1, className = "" }: RangeSliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className={`relative ${className}`} style={{ height: '12px' }}>
      {/* Фоновый трек */}
      <div className="absolute inset-0 h-3 bg-[var(--bg-tertiary)] rounded-lg" style={{ zIndex: 1 }}></div>
      
      {/* Заполненная часть */}
      <div 
        className="absolute top-0 left-0 h-3 bg-[var(--accent-primary)] rounded-lg transition-all duration-200"
        style={{ 
          width: `${percentage}%`,
          zIndex: 2
        }}
      ></div>
      
      {/* Скрытый HTML слайдер для обработки событий */}
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="slider-input"
      />
      
      {/* Кастомный ползунок - единственный видимый элемент */}
      <div 
        className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-[var(--accent-primary)] transition-all duration-200 ${
          isDragging ? 'scale-125 shadow-xl' : 'hover:scale-110'
        }`}
        style={{ 
          left: `calc(${percentage}% - 12px)`,
          zIndex: 5,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
