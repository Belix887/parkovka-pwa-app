"use client";

import Link from "next/link";
import { PWAInstallButton } from "@/components/pwa/PWAComponents";

export default function MobileAppHome() {
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

      {/* Быстрые действия */}
      <section className="quick-actions-section">
        <h2 className="section-title">Быстрые действия</h2>
        <div className="quick-actions-grid">
          <Link href="/mobile-app/catalog" className="quick-action-card">
            <div className="action-icon">🚗</div>
            <div className="action-text">
              <h3>Найти парковку</h3>
              <p>Поиск по городу</p>
            </div>
          </Link>
          
          <Link href="/mobile-app/map" className="quick-action-card">
            <div className="action-icon">🗺️</div>
            <div className="action-text">
              <h3>Карта</h3>
              <p>Интерактивная карта</p>
            </div>
          </Link>
          
          <Link href="/mobile-app/spots/create" className="quick-action-card">
            <div className="action-icon">➕</div>
            <div className="action-text">
              <h3>Сдать место</h3>
              <p>Добавить парковку</p>
            </div>
          </Link>
          
          <Link href="/mobile-app/pwa-demo" className="quick-action-card">
            <div className="action-icon">🚀</div>
            <div className="action-text">
              <h3>PWA Демо</h3>
              <p>Тестирование функций</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Популярные места */}
      <section className="featured-spots-section">
        <h2 className="section-title">Популярные места</h2>
        <div className="spots-grid">
          <div className="spot-card">
            <div className="spot-image">
              <img 
                src="https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop" 
                alt="Парковка у Красной площади"
                className="spot-photo"
              />
            </div>
            <div className="spot-info">
              <h3 className="spot-title">Парковка у Красной площади</h3>
              <p className="spot-address">Красная площадь, 1, Москва</p>
              <p className="spot-price">200 ₽/час</p>
            </div>
          </div>
          
          <div className="spot-card">
            <div className="spot-image">
              <img 
                src="https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop" 
                alt="Парковка у ТЦ"
                className="spot-photo"
              />
            </div>
            <div className="spot-info">
              <h3 className="spot-title">Парковка у ТЦ</h3>
              <p className="spot-address">Тверская улица, 15, Москва</p>
              <p className="spot-price">150 ₽/час</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}