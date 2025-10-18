"use client";

import { usePWA } from '@/lib/pwa';
import { useState } from 'react';

export function PWAInstallButton() {
  const { canInstall, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

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

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className="pwa-install-btn"
    >
      {isInstalling ? (
        <>
          <span className="loading-spinner"></span>
          Установка...
        </>
      ) : (
        <>
          <span className="install-icon">📱</span>
          Установить приложение
        </>
      )}
    </button>
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
