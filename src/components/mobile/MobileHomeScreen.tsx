"use client";
import { useState } from "react";

interface MobileHomeScreenProps {
  onOpenApp: () => void;
  onLock: () => void;
}

export function MobileHomeScreen({ onOpenApp, onLock }: MobileHomeScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Случайные приложения для демонстрации
  const apps = [
    { name: "Сообщения", icon: "💬", color: "#007AFF" },
    { name: "Телефон", icon: "📞", color: "#34C759" },
    { name: "Камера", icon: "📷", color: "#FF9500" },
    { name: "Фото", icon: "🖼️", color: "#FF2D92" },
    { name: "Музыка", icon: "🎵", color: "#FF3B30" },
    { name: "Карты", icon: "🗺️", color: "#007AFF" },
    { name: "Погода", icon: "☀️", color: "#FF9500" },
    { name: "Настройки", icon: "⚙️", color: "#8E8E93" },
    { name: "Календарь", icon: "📅", color: "#007AFF" },
    { name: "Заметки", icon: "📝", color: "#FFCC00" },
    { name: "Safari", icon: "🌐", color: "#007AFF" },
    { name: "App Store", icon: "🛍️", color: "#007AFF" },
    { name: "Парковка", icon: "🚗", color: "#3B82F6", isOurApp: true },
    { name: "Mail", icon: "📧", color: "#007AFF" },
    { name: "Контакты", icon: "👥", color: "#007AFF" },
    { name: "Файлы", icon: "📁", color: "#007AFF" },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleAppClick = (app: any) => {
    if (app.isOurApp) {
      onOpenApp();
    }
  };

  return (
    <div className="home-screen">
      {/* Статус бар домашнего экрана */}
      <div className="home-status-bar">
        <div className="status-left">
          <span className="time">{formatTime(currentTime)}</span>
        </div>
        <div className="status-right">
          <div className="signal-bars">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="wifi-icon">📶</span>
          <span className="battery-icon">🔋</span>
        </div>
      </div>

      {/* Поиск */}
      <div className="home-search">
        <div className="search-bar">
          <div className="search-icon">🔍</div>
          <div className="search-text">Поиск</div>
        </div>
      </div>

      {/* Виджеты */}
      <div className="home-widgets">
        <div className="widget-card">
          <div className="widget-icon">📅</div>
          <div className="widget-content">
            <div className="widget-title">Сегодня</div>
            <div className="widget-subtitle">16 октября</div>
          </div>
        </div>
        
        <div className="widget-card">
          <div className="widget-icon">☀️</div>
          <div className="widget-content">
            <div className="widget-title">Погода</div>
            <div className="widget-subtitle">22°C, солнечно</div>
          </div>
        </div>
      </div>

      {/* Сетка приложений */}
      <div className="apps-grid">
        {apps.map((app, index) => (
          <div 
            key={index}
            className={`app-icon ${app.isOurApp ? 'our-app' : ''}`}
            onClick={() => handleAppClick(app)}
            style={{ 
              animationDelay: `${index * 0.05}s`,
              '--app-color': app.color 
            } as React.CSSProperties}
          >
            <div 
              className="app-icon-background"
              style={{ backgroundColor: app.color }}
            >
              <div className="app-icon-emoji">{app.icon}</div>
            </div>
            <div className="app-name">{app.name}</div>
            {app.isOurApp && (
              <div className="app-badge">
                <div className="badge-dot"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Док-бар */}
      <div className="home-dock">
        <div className="dock-apps">
          <div className="dock-app">
            <div className="dock-icon">📞</div>
          </div>
          <div className="dock-app">
            <div className="dock-icon">💬</div>
          </div>
          <div className="dock-app">
            <div className="dock-icon">📷</div>
          </div>
          <div className="dock-app">
            <div className="dock-icon">🖼️</div>
          </div>
        </div>
      </div>

      {/* Индикатор страниц */}
      <div className="home-page-indicator">
        <div className="page-dot active"></div>
        <div className="page-dot"></div>
        <div className="page-dot"></div>
      </div>

      {/* Кнопка блокировки */}
      <div className="lock-button" onClick={onLock}>
        <div className="lock-icon">🔒</div>
      </div>
    </div>
  );
}
