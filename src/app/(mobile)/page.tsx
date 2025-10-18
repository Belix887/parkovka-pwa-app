"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MobileSpotCard } from "@/components/mobile/MobileSpotCard";
import { MobileMapPreview } from "@/components/mobile/MobileMapPreview";
import { MobileQuickActions } from "@/components/mobile/MobileQuickActions";
import { PWAInstallButton } from "@/components/pwa/PWAComponents";

interface Spot {
  id: string;
  title: string;
  address: string;
  pricePerHour: number;
  image?: string;
  features: string[];
  photos?: { url: string }[];
}

export default function MobileAppHome() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedSpots();
  }, []);

  const loadFeaturedSpots = async () => {
    try {
      const response = await fetch('/api/spots/map');
      const data = await response.json();
      setSpots(data.spots?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error loading spots:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-home-app">
      {/* Приветственная секция */}
      <section className="welcome-section-app">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1 className="welcome-title">
              Найдите идеальное
              <span className="gradient-text"> парковочное место</span>
            </h1>
            <p className="welcome-subtitle">
              Арендуйте частные парковочные места или сдавайте свои в аренду
            </p>
          </div>
          
          <div className="welcome-stats">
            <div className="stat-card">
              <div className="stat-icon">🚗</div>
              <div className="stat-info">
                <div className="stat-number">6</div>
                <div className="stat-label">Парковок</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-number">70₽</div>
                <div className="stat-label">от/час</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛡️</div>
              <div className="stat-info">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Охрана</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Быстрые действия */}
      <section className="quick-actions-section">
        <h2 className="section-title">Быстрые действия</h2>
        <MobileQuickActions />
      </section>

      {/* Популярные парковки */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Популярные парковки</h2>
          <Link href="/(mobile)/catalog" className="see-all-link">
            Все парковки
            <span className="arrow">→</span>
          </Link>
        </div>
        
        {loading ? (
          <div className="loading-spots">
            <div className="loading-card"></div>
            <div className="loading-card"></div>
            <div className="loading-card"></div>
          </div>
        ) : (
          <div className="spots-grid">
            {spots.map((spot) => (
              <MobileSpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      </section>

      {/* Карта */}
      <section className="map-section">
        <div className="section-header">
          <h2 className="section-title">Карта парковок</h2>
          <Link href="/(mobile)/map" className="see-all-link">
            Открыть карту
            <span className="arrow">→</span>
          </Link>
        </div>
        <MobileMapPreview />
      </section>

      {/* CTA секция */}
      <section className="cta-section-app">
        <div className="cta-content">
          <div className="cta-icon">🚀</div>
          <h2 className="cta-title">Готовы начать?</h2>
          <p className="cta-subtitle">
            Присоединяйтесь к тысячам пользователей, которые уже экономят на парковке
          </p>
          <div className="cta-buttons">
            <Link href="/(mobile)/register" className="cta-primary">
              Зарегистрироваться
            </Link>
            <Link href="/(mobile)/login" className="cta-secondary">
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </section>

      {/* PWA Install Section */}
      <section className="pwa-install-section">
        <div className="pwa-install-content">
          <div className="pwa-install-icon">📱</div>
          <div className="pwa-install-text">
            <h2 className="pwa-install-title">Установите приложение</h2>
            <p className="pwa-install-description">
              Добавьте приложение на главный экран для быстрого доступа
            </p>
          </div>
          <PWAInstallButton />
        </div>
      </section>
    </div>
  );
}
