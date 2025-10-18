"use client";

import { usePWA } from '@/lib/pwa';
import { useState, useEffect } from 'react';

export function PWAInstallButton() {
  const { canInstall, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [installResult, setInstallResult] = useState('');

  // Добавляем отладочную информацию
  useEffect(() => {
    const info = {
      canInstall,
      isInstalled,
      userAgent: navigator.userAgent,
      isHTTPS: location.protocol === 'https:',
      hasServiceWorker: 'serviceWorker' in navigator,
      displayMode: window.matchMedia('(display-mode: standalone)').matches,
      isInStandaloneMode: (window.navigator as any).standalone === true,
      referrer: document.referrer,
      installPromptEvent: 'beforeinstallprompt' in window
    };
    setDebugInfo(JSON.stringify(info, null, 2));
  }, [canInstall, isInstalled]);

  if (isInstalled) {
    return (
      <div className="pwa-status">
        <div className="status-badge installed">
          <span className="status-icon">✓</span>
          <span className="status-text">Установлено</span>
        </div>
      </div>
    );
  }

  const handleInstall = async () => {
    console.log('🚀 Install button clicked');
    setButtonClicked(true);
    setIsInstalling(true);
    setInstallResult('');
    
    // Анимация нажатия
    setTimeout(() => setButtonClicked(false), 200);
    
    try {
      await installApp();
      console.log('✅ Install completed');
      setInstallResult('✅ Установка завершена успешно!');
    } catch (error) {
      console.error('❌ Installation failed:', error);
      setInstallResult('❌ Ошибка установки: ' + error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={handleInstall}
        disabled={isInstalling}
        className="pwa-install-btn"
        style={{
          background: buttonClicked 
            ? 'linear-gradient(135deg, #1d4ed8, #7c3aed)' 
            : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isInstalling ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          transform: buttonClicked ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.2s ease',
          boxShadow: buttonClicked 
            ? '0 4px 15px rgba(59, 130, 246, 0.4)' 
            : '0 2px 10px rgba(59, 130, 246, 0.2)',
          opacity: isInstalling ? 0.7 : 1
        }}
      >
        {isInstalling ? (
          <>
            <span style={{ 
              animation: 'spin 1s linear infinite',
              fontSize: '18px'
            }}>⏳</span>
            Установка...
          </>
        ) : (
          <>
            <span className="install-icon" style={{ fontSize: '18px' }}>📱</span>
            Установить приложение
          </>
        )}
      </button>
      
      {/* Результат установки */}
      {installResult && (
        <div style={{
          marginTop: '12px',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          background: installResult.includes('✅') 
            ? 'rgba(16, 185, 129, 0.2)' 
            : 'rgba(239, 68, 68, 0.2)',
          border: installResult.includes('✅') 
            ? '1px solid rgba(16, 185, 129, 0.3)' 
            : '1px solid rgba(239, 68, 68, 0.3)',
          color: installResult.includes('✅') ? '#10b981' : '#ef4444'
        }}>
          {installResult}
        </div>
      )}
      
      {/* Отладочная информация */}
      <details style={{ marginTop: '16px', textAlign: 'left' }}>
        <summary style={{ cursor: 'pointer', color: '#94a3b8' }}>🔍 Отладочная информация</summary>
        <pre style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '8px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {debugInfo}
        </pre>
      </details>

      {/* CSS для анимации */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function PWAUpdateNotification() {
  const { updateAvailable, updateApp } = usePWA();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!updateAvailable) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  return (
    <div className="pwa-update-notification">
      <div className="update-content">
        <div className="update-icon">🔄</div>
        <div className="update-text">
          <div className="update-title">Доступно обновление</div>
          <div className="update-subtitle">Новая версия приложения готова</div>
        </div>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="update-btn"
        >
          {isUpdating ? 'Обновление...' : 'Обновить'}
        </button>
      </div>
    </div>
  );
}

export function PWAOfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="pwa-offline-indicator">
      <div className="offline-content">
        <span className="offline-icon">📶</span>
        <span className="offline-text">Нет подключения к интернету</span>
      </div>
    </div>
  );
}

export function PWANotificationButton() {
  const { requestNotificationPermission, sendNotification } = usePWA();
  const [permissionGranted, setPermissionGranted] = useState(false);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    
    if (granted) {
      sendNotification('Уведомления включены!', {
        body: 'Теперь вы будете получать уведомления о парковках',
        tag: 'permission-granted'
      });
    }
  };

  const handleTestNotification = () => {
    sendNotification('Тестовое уведомление', {
      body: 'Это тестовое уведомление от приложения Парковка',
      tag: 'test-notification'
    });
  };

  return (
    <div className="pwa-notification-controls">
      {!permissionGranted ? (
        <button
          onClick={handleRequestPermission}
          className="notification-permission-btn"
        >
          <span className="notification-icon">🔔</span>
          Включить уведомления
        </button>
      ) : (
        <button
          onClick={handleTestNotification}
          className="notification-test-btn"
        >
          <span className="notification-icon">🔔</span>
          Тест уведомления
        </button>
      )}
    </div>
  );
}
