"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";

interface User {
  name: string;
  email: string;
}

interface MobileHeaderProps {
  user: User | null;
  isLoading: boolean;
  onClose?: () => void;
}

export function MobileHeader({ user, isLoading, onClose }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Основной заголовок */}
      <header className="mobile-header">
        <div className="header-content">
          <div className="header-left">
            <Logo href="/mobile-app" size="sm" showText={true} />
          </div>
          
          <div className="header-right">
            {onClose && (
              <button className="close-app-btn" onClick={onClose}>
                <span className="close-icon">⬇️</span>
              </button>
            )}
            
            {!isLoading && (
              <>
                {user ? (
                  <Link href="/mobile-app/profile" className="user-avatar">
                    <div className="avatar-circle">
                      {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                  </Link>
                ) : (
                  <div className="auth-buttons">
                    <Link href="/mobile-app/login" className="login-btn">
                      Вход
                    </Link>
                    <Link href="/mobile-app/register" className="register-btn">
                      Регистрация
                    </Link>
                  </div>
                )}
                
                <button 
                  className="menu-toggle"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Выпадающее меню */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <div className="menu-header">
            <Logo href="/mobile-app" size="md" showText={true} />
            <button 
              className="menu-close"
              onClick={() => setIsMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <nav className="menu-nav">
            <Link href="/mobile-app/catalog" className="menu-item">
              <span className="menu-icon">🚗</span>
              <span className="menu-text">Каталог</span>
            </Link>
            <Link href="/mobile-app/map" className="menu-item">
              <span className="menu-icon">🗺️</span>
              <span className="menu-text">Карта</span>
            </Link>
            <Link href="/mobile-app/spots/create" className="menu-item">
              <span className="menu-icon">➕</span>
              <span className="menu-text">Создать место</span>
            </Link>
            {user && (
              <Link href="/mobile-app/requests" className="menu-item">
                <span className="menu-icon">📋</span>
                <span className="menu-text">Заявки</span>
              </Link>
            )}
            <Link href="/mobile-app/profile" className="menu-item">
              <span className="menu-icon">👤</span>
              <span className="menu-text">Профиль</span>
            </Link>
          </nav>
          
          <div className="menu-footer">
            <div className="menu-stats">
              <div className="stat-item">
                <span className="stat-number">6</span>
                <span className="stat-label">Парковок</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Поддержка</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Безопасность</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay для меню */}
      {isMenuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
