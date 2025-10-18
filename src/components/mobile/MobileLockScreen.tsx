"use client";
import { useState, useEffect } from "react";

interface MobileLockScreenProps {
  onUnlock: () => void;
  user: any;
  isLoading: boolean;
}

export function MobileLockScreen({ onUnlock, user, isLoading }: MobileLockScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const handleSwipeUp = () => {
    if (isUnlocking) return;
    
    setIsUnlocking(true);
    setTimeout(() => {
      onUnlock();
    }, 800);
  };

  return (
    <div className="lock-screen">
      {/* Фоновое изображение */}
      <div className="lock-background">
        <div className="background-gradient"></div>
        <div className="background-pattern"></div>
      </div>

      {/* Время и дата */}
      <div className="lock-time-section">
        <div className="lock-time">{formatTime(currentTime)}</div>
        <div className="lock-date">{formatDate(currentTime)}</div>
      </div>

      {/* Уведомления */}
      <div className="lock-notifications">
        <div className="notification-item">
          <div className="notification-icon">📱</div>
          <div className="notification-content">
            <div className="notification-title">Парковка</div>
            <div className="notification-text">Найдено 6 новых мест рядом с вами</div>
          </div>
        </div>
        
        <div className="notification-item">
          <div className="notification-icon">💰</div>
          <div className="notification-content">
            <div className="notification-title">Заработок</div>
            <div className="notification-text">+250₽ за сегодня</div>
          </div>
        </div>
      </div>

      {/* Индикатор разблокировки */}
      <div className="unlock-indicator" onClick={handleSwipeUp}>
        <div className={`unlock-handle ${isUnlocking ? 'unlocking' : ''}`}>
          <div className="unlock-icon">🔓</div>
        </div>
        <div className="unlock-text">
          {isUnlocking ? 'Разблокировка...' : 'Проведите вверх для разблокировки'}
        </div>
      </div>

      {/* Камера */}
      <div className="lock-camera">
        <div className="camera-icon">📷</div>
      </div>

      {/* Фонарик */}
      <div className="lock-flashlight">
        <div className="flashlight-icon">🔦</div>
      </div>
    </div>
  );
}
