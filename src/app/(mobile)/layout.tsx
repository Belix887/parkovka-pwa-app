"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import "./mobile-app.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { useState, useEffect } from "react";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { PWAUpdateNotification, PWAOfflineIndicator } from "@/components/pwa/PWAComponents";
import "@/components/pwa/PWAComponents.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface User {
  name: string;
  email: string;
}

export default function MobileAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
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

  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Парковка - Мобильное приложение</title>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Парковка" />
        <meta name="description" content="Найдите и забронируйте парковочное место в вашем городе" />
        <meta name="keywords" content="парковка, бронирование, мобильное приложение" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        
        {/* Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Парковка" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Парковка - Умная парковка" />
        <meta property="og:description" content="Найдите и забронируйте парковочное место в вашем городе" />
        <meta property="og:image" content="/icons/icon-512x512.png" />
        <meta property="og:url" content="/mobile-app" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Парковка - Умная парковка" />
        <meta name="twitter:description" content="Найдите и забронируйте парковочное место в вашем городе" />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mobile-app-body`}
      >
        <ToastProvider>
          {/* PWA Components */}
          <PWAUpdateNotification />
          <PWAOfflineIndicator />
          
          {/* Мобильное приложение */}
          <div className="mobile-app-container">
            {/* Статус бар */}
            <div className="mobile-status-bar">
              <div className="status-left">
                <span className="time">9:41</span>
              </div>
              <div className="status-right">
                <div className="signal-bars">
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
                <div className="wifi-icon">📶</div>
                <div className="battery">
                  <div className="battery-level"></div>
                </div>
              </div>
            </div>

            {/* Заголовок приложения */}
            <MobileHeader user={user} isLoading={isLoading} />

            {/* Основной контент */}
            <main className="mobile-app-content">
              <div className="app-content-wrapper">
                {children}
              </div>
            </main>

            {/* Нижняя навигация */}
            <MobileNavigation user={user} />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
