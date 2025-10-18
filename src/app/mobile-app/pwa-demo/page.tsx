"use client";

import { PWAInstallButton, PWANotificationButton } from "@/components/pwa/PWAComponents";
import { usePWA } from "@/lib/pwa";

export default function PWADemoPage() {
  const { isInstalled, isOnline, updateAvailable } = usePWA();

  return (
    <div className="pwa-demo-page">
      <h1 className="pwa-demo-title">PWA Демонстрация</h1>
      <p className="pwa-demo-description">
        Здесь вы можете увидеть и протестировать основные функции Progressive Web App.
      </p>

      <div className="pwa-status-cards">
        <div className={`status-card ${isInstalled ? 'active' : ''}`}>
          <span className="status-icon">{isInstalled ? '✅' : '📱'}</span>
          <span className="status-label">Установлено:</span>
          <span className="status-value">{isInstalled ? 'Да' : 'Нет'}</span>
        </div>
        <div className={`status-card ${isOnline ? 'active' : 'offline'}`}>
          <span className="status-icon">{isOnline ? '🌐' : '🚫'}</span>
          <span className="status-label">Статус сети:</span>
          <span className="status-value">{isOnline ? 'Онлайн' : 'Оффлайн'}</span>
        </div>
        <div className="status-card">
          <span className="status-icon">{updateAvailable ? '⬆️' : '✨'}</span>
          <span className="status-label">Обновление:</span>
          <span className="status-value">{updateAvailable ? 'Доступно' : 'Нет'}</span>
        </div>
      </div>

      <section className="pwa-feature-section">
        <h2 className="feature-section-title">Установка приложения</h2>
        <p className="feature-section-description">
          Добавьте это приложение на главный экран вашего устройства для быстрого доступа.
        </p>
        <PWAInstallButton />
      </section>

      <section className="pwa-feature-section">
        <h2 className="feature-section-title">Push-уведомления</h2>
        <p className="feature-section-description">
          Проверьте работу push-уведомлений. Вам может потребоваться разрешить их в браузере.
        </p>
        <PWANotificationButton />
      </section>

      <section className="pwa-feature-section">
        <h2 className="feature-section-title">Офлайн режим</h2>
        <p className="feature-section-description">
          Отключите интернет и перезагрузите страницу, чтобы увидеть, как приложение работает без сети.
        </p>
        <div className="offline-test-area">
          <p>Тестовый контент, доступный офлайн.</p>
          <p>Дата и время последнего обновления: {new Date().toLocaleString()}</p>
        </div>
      </section>
    </div>
  );
}
