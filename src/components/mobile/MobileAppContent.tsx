"use client";
import { useState, useEffect } from "react";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { MobileHeader } from "@/components/mobile/MobileHeader";

interface MobileAppContentProps {
  onClose: () => void;
  user: any;
  isLoading: boolean;
  children: React.ReactNode;
}

export function MobileAppContent({ onClose, user, isLoading, children }: MobileAppContentProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`app-content ${isClosing ? 'closing' : ''}`}>
      {/* Заголовок приложения */}
      <MobileHeader user={user} isLoading={isLoading} onClose={handleClose} />

      {/* Основной контент */}
      <div className="app-main-content">
        <div className="app-content-wrapper">
          {children}
        </div>
      </div>

      {/* Нижняя навигация */}
      <MobileNavigation user={user} />

      {/* Кнопка закрытия приложения */}
      <div className="app-close-button" onClick={handleClose}>
        <div className="close-icon">⬇️</div>
      </div>
    </div>
  );
}
