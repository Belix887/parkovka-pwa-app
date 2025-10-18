"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./mobile-app.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { useState, useEffect } from "react";
import { MobileLockScreen } from "@/components/mobile/MobileLockScreen";
import { MobileHomeScreen } from "@/components/mobile/MobileHomeScreen";
import { MobileAppContent } from "@/components/mobile/MobileAppContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function MobileAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLocked, setIsLocked] = useState(true);
  const [isOnHomeScreen, setIsOnHomeScreen] = useState(false);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки пользователя для демонстрации
    setTimeout(() => {
      setUser({
        name: "Иван Иванов",
        email: "ivan@example.com"
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleUnlock = () => {
    setIsLocked(false);
    setTimeout(() => {
      setIsOnHomeScreen(true);
    }, 500);
  };

  const handleOpenApp = () => {
    setIsOnHomeScreen(false);
    setTimeout(() => {
      setIsAppOpen(true);
    }, 300);
  };

  const handleCloseApp = () => {
    setIsAppOpen(false);
    setTimeout(() => {
      setIsOnHomeScreen(true);
    }, 300);
  };

  const handleLock = () => {
    setIsOnHomeScreen(false);
    setIsAppOpen(false);
    setTimeout(() => {
      setIsLocked(true);
    }, 300);
  };

  return (
    <html lang="ru">
      <head>
        {/* Дополнительные мета-теги для мобильного */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0a0e1a" />
        {/* Агрессивные стили для скрытия всех возможных верхних баров */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          header:not(.mobile-header),
          nav:not(.mobile-bottom-nav),
          .navbar, .top-bar, .desktop-header, .main-header, .site-header, .navigation, .header-nav, .top-navigation, .app-header:not(.mobile-header), .page-header, .site-nav, .primary-nav, .main-nav, .header-container, .nav-container:not(.nav-container), .header-wrapper, .navigation-bar, .top-menu, .main-menu, .header-menu, .site-menu, .primary-menu, .nav-menu, .menu-container, .header-content:not(.header-content), .nav-wrapper, .header-nav-wrapper, .main-header-wrapper, .site-header-wrapper, .navigation-wrapper, .header-section, .nav-section, .top-section, .header-bar, .nav-bar, .top-nav, .main-nav-bar, .site-nav-bar, .header-nav-bar, .primary-nav-bar, .navigation-bar, .top-nav-bar, .main-nav-bar, .site-nav-bar, .header-nav-bar, .primary-nav-bar, .nav-bar-container, .header-nav-container, .main-nav-container, .site-nav-container, .navigation-container, .top-nav-container, .nav-container-wrapper, .header-nav-wrapper, .main-nav-wrapper, .site-nav-wrapper, .navigation-wrapper, .top-nav-wrapper,
          [class*="header"]:not(.mobile-header):not(.header-content),
          [class*="nav"]:not(.mobile-bottom-nav):not(.nav-container),
          [class*="navbar"], [class*="top-bar"], [class*="desktop-header"], [class*="main-header"], [class*="site-header"], [class*="navigation"], [class*="header-nav"], [class*="top-navigation"], [class*="app-header"]:not(.mobile-header), [class*="page-header"], [class*="site-nav"], [class*="primary-nav"], [class*="main-nav"], [class*="header-container"], [class*="nav-container"]:not(.nav-container), [class*="header-wrapper"], [class*="navigation-bar"], [class*="top-menu"], [class*="main-menu"], [class*="header-menu"], [class*="site-menu"], [class*="primary-menu"], [class*="nav-menu"], [class*="menu-container"], [class*="header-content"]:not(.header-content), [class*="nav-wrapper"], [class*="header-nav-wrapper"], [class*="main-header-wrapper"], [class*="site-header-wrapper"], [class*="navigation-wrapper"], [class*="header-section"], [class*="nav-section"], [class*="top-section"], [class*="header-bar"], [class*="nav-bar"], [class*="top-nav"], [class*="main-nav-bar"], [class*="site-nav-bar"], [class*="header-nav-bar"], [class*="primary-nav-bar"], [class*="navigation-bar"], [class*="top-nav-bar"], [class*="main-nav-bar"], [class*="site-nav-bar"], [class*="header-nav-bar"], [class*="primary-nav-bar"], [class*="nav-bar-container"], [class*="header-nav-container"], [class*="main-nav-container"], [class*="site-nav-container"], [class*="navigation-container"], [class*="top-nav-container"], [class*="nav-container-wrapper"], [class*="header-nav-wrapper"], [class*="main-nav-wrapper"], [class*="site-nav-wrapper"], [class*="navigation-wrapper"], [class*="top-nav-wrapper"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            z-index: -9999 !important;
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mobile-app-body`}
      >
        <ToastProvider>
          {/* Мобильное приложение */}
          <div className="mobile-app-container">
            {/* Динамический остров */}
            <div className="phone-notch">
              <div className="notch-content">
                <div className="notch-camera"></div>
                <div className="notch-speaker"></div>
              </div>
            </div>

            {/* Статус бар */}
            <div className="mobile-status-bar">
              <div className="status-left">
                <span className="time">9:41</span>
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

            {/* Основной контент */}
            <main className="mobile-app-content">
              {isLocked && (
                <MobileLockScreen 
                  onUnlock={handleUnlock}
                  user={user}
                  isLoading={isLoading}
                />
              )}
              
              {isOnHomeScreen && !isLocked && !isAppOpen && (
                <MobileHomeScreen 
                  onOpenApp={handleOpenApp}
                  onLock={handleLock}
                />
              )}
              
              {isAppOpen && !isLocked && !isOnHomeScreen && (
                <MobileAppContent 
                  onClose={handleCloseApp}
                  user={user}
                  isLoading={isLoading}
                >
                  {children}
                </MobileAppContent>
              )}
            </main>

            {/* Домашний индикатор */}
            <div className="home-indicator"></div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}