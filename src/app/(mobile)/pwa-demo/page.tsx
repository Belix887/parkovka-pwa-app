"use client";

import { PWAInstallButton, PWANotificationButton } from "@/components/pwa/PWAComponents";
import { usePWA } from "@/lib/pwa";
import "./pwa-demo.css";

export default function PWADemoPage() {
  const { isInstalled, isOnline, updateAvailable } = usePWA();

  return (
    <div className="pwa-demo-page">
      <div className="demo-header">
        <h1 className="demo-title">🚀 PWA Функции</h1>
        <p className="demo-subtitle">Демонстрация возможностей Progressive Web App</p>
      </div>

      <div className="demo-content">
        {/* Статус приложения */}
        <div className="status-section">
          <h2 className="section-title">Статус приложения</h2>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-icon">📱</div>
              <div className="status-info">
                <div className="status-label">Установка</div>
                <div className={`status-value ${isInstalled ? 'installed' : 'not-installed'}`}>
                  {isInstalled ? 'Установлено' : 'Не установлено'}
                </div>
              </div>
            </div>
            
            <div className="status-item">
              <div className="status-icon">🌐</div>
              <div className="status-info">
                <div className="status-label">Подключение</div>
                <div className={`status-value ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? 'Онлайн' : 'Офлайн'}
                </div>
              </div>
            </div>
            
            <div className="status-item">
              <div className="status-icon">🔄</div>
              <div className="status-info">
                <div className="status-label">Обновления</div>
                <div className={`status-value ${updateAvailable ? 'available' : 'up-to-date'}`}>
                  {updateAvailable ? 'Доступно' : 'Актуально'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Установка приложения */}
        <div className="install-section">
          <h2 className="section-title">Установка приложения</h2>
          <div className="install-content">
            <div className="install-info">
              <div className="install-icon">📲</div>
              <div className="install-text">
                <h3 className="install-title">Установите приложение</h3>
                <p className="install-description">
                  Добавьте приложение на главный экран для быстрого доступа
                </p>
              </div>
            </div>
            <PWAInstallButton />
          </div>
        </div>

        {/* Уведомления */}
        <div className="notifications-section">
          <h2 className="section-title">Уведомления</h2>
          <div className="notifications-content">
            <div className="notifications-info">
              <div className="notifications-icon">🔔</div>
              <div className="notifications-text">
                <h3 className="notifications-title">Push уведомления</h3>
                <p className="notifications-description">
                  Получайте уведомления о новых парковках и бронированиях
                </p>
              </div>
            </div>
            <PWANotificationButton />
          </div>
        </div>

        {/* Возможности PWA */}
        <div className="features-section">
          <h2 className="section-title">Возможности PWA</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Быстрая загрузка</h3>
              <p className="feature-description">
                Кеширование ресурсов для мгновенной загрузки
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Нативный вид</h3>
              <p className="feature-description">
                Выглядит и работает как нативное приложение
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3 className="feature-title">Офлайн режим</h3>
              <p className="feature-description">
                Работает без подключения к интернету
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3 className="feature-title">Уведомления</h3>
              <p className="feature-description">
                Push уведомления даже когда приложение закрыто
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3 className="feature-title">Автообновления</h3>
              <p className="feature-description">
                Автоматическое обновление до новой версии
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Безопасность</h3>
              <p className="feature-description">
                HTTPS и безопасное хранение данных
              </p>
            </div>
          </div>
        </div>

        {/* Инструкции по установке */}
        <div className="instructions-section">
          <h2 className="section-title">Как установить</h2>
          <div className="instructions-content">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Откройте в браузере</h3>
                <p className="step-description">
                  Используйте Chrome, Safari, Edge или Firefox
                </p>
              </div>
            </div>
            
            <div className="instruction-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Нажмите &quot;Установить&quot;</h3>
                <p className="step-description">
                  Найдите кнопку установки в адресной строке или меню
                </p>
              </div>
            </div>
            
            <div className="instruction-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Готово!</h3>
                <p className="step-description">
                  Приложение появится на главном экране устройства
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
