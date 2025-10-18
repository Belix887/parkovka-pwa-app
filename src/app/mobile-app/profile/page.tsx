"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating: number;
  totalBookings: number;
  totalEarnings: number;
  memberSince: string;
}

interface Booking {
  id: string;
  spotTitle: string;
  spotAddress: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: "active" | "completed" | "cancelled";
}

export default function MobileProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "settings">("profile");
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadBookings();
  }, []);

  const loadUserData = async () => {
    try {
      // Имитация загрузки данных пользователя
      setTimeout(() => {
        setUser({
          id: "1",
          name: "Иван Иванов",
          email: "ivan@example.com",
          phone: "+7 (999) 123-45-67",
          avatar: "",
          rating: 4.8,
          totalBookings: 24,
          totalEarnings: 15600,
          memberSince: "2023-01-15",
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      // Имитация загрузки бронирований
      setTimeout(() => {
        setBookings([
          {
            id: "1",
            spotTitle: "Парковка у Красной площади",
            spotAddress: "Красная площадь, 1, Москва",
            startTime: "2024-01-15T10:00:00",
            endTime: "2024-01-15T12:00:00",
            totalPrice: 400,
            status: "active",
          },
          {
            id: "2",
            spotTitle: "Крытая парковка в ТЦ",
            spotAddress: "Тверская, 15, Москва",
            startTime: "2024-01-14T14:00:00",
            endTime: "2024-01-14T16:00:00",
            totalPrice: 300,
            status: "completed",
          },
        ]);
      }, 500);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handleLogout = () => {
    // Логика выхода
    router.push("/mobile-app/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      active: "Активно",
      completed: "Завершено",
      cancelled: "Отменено",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      active: "#10b981",
      completed: "#6b7280",
      cancelled: "#ef4444",
    };
    return colorMap[status as keyof typeof colorMap] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="mobile-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mobile-profile-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки</h3>
          <p>Не удалось загрузить данные профиля</p>
          <button className="retry-button" onClick={loadUserData}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-profile-page">
      {/* Заголовок профиля */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name[0].toUpperCase()}
          </div>
          <button className="edit-avatar-btn">
            <span className="edit-icon">📷</span>
          </button>
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          {user.phone && (
            <p className="profile-phone">{user.phone}</p>
          )}
        </div>

        <button className="edit-profile-btn">
          <span className="edit-icon">✏️</span>
        </button>
      </div>

      {/* Статистика */}
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{user.rating}</div>
          <div className="stat-label">Рейтинг</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🚗</div>
          <div className="stat-value">{user.totalBookings}</div>
          <div className="stat-label">Бронирований</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{user.totalEarnings.toLocaleString()}₽</div>
          <div className="stat-label">Сэкономлено</div>
        </div>
      </div>

      {/* Табы */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Профиль
        </button>
        <button
          className={`tab-button ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          Бронирования
        </button>
        <button
          className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Настройки
        </button>
      </div>

      {/* Контент табов */}
      <div className="profile-content">
        {activeTab === "profile" && (
          <div className="profile-details">
            <div className="detail-section">
              <h3 className="section-title">Личная информация</h3>
              <div className="detail-item">
                <span className="detail-label">Имя</span>
                <span className="detail-value">{user.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Телефон</span>
                <span className="detail-value">{user.phone || "Не указан"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Участник с</span>
                <span className="detail-value">
                  {new Date(user.memberSince).toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title">Быстрые действия</h3>
              <div className="quick-actions">
                <Link href="/mobile-app/spots/create" className="quick-action">
                  <span className="action-icon">➕</span>
                  <span className="action-text">Сдать место</span>
                </Link>
                <Link href="/mobile-app/bookings" className="quick-action">
                  <span className="action-icon">📋</span>
                  <span className="action-text">Мои бронирования</span>
                </Link>
                <Link href="/mobile-app/favorites" className="quick-action">
                  <span className="action-icon">❤️</span>
                  <span className="action-text">Избранное</span>
                </Link>
                <Link href="/mobile-app/support" className="quick-action">
                  <span className="action-icon">💬</span>
                  <span className="action-text">Поддержка</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bookings-list">
            <h3 className="section-title">Мои бронирования</h3>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>Нет бронирований</h4>
                <p>У вас пока нет активных бронирований</p>
                <Link href="/mobile-app/catalog" className="cta-button">
                  Найти парковку
                </Link>
              </div>
            ) : (
              <div className="bookings-grid">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h4 className="booking-title">{booking.spotTitle}</h4>
                      <span
                        className="booking-status"
                        style={{ color: getStatusColor(booking.status) }}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="booking-details">
                      <div className="booking-address">
                        <span className="address-icon">📍</span>
                        {booking.spotAddress}
                      </div>
                      <div className="booking-time">
                        <span className="time-icon">🕐</span>
                        {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                      </div>
                      <div className="booking-price">
                        <span className="price-icon">💰</span>
                        {booking.totalPrice}₽
                      </div>
                    </div>
                    <div className="booking-actions">
                      <button className="action-button secondary">
                        Подробнее
                      </button>
                      {booking.status === "active" && (
                        <button className="action-button danger">
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-list">
            <h3 className="section-title">Настройки</h3>
            <div className="settings-group">
              <h4 className="group-title">Уведомления</h4>
              <div className="setting-item">
                <span className="setting-label">Push-уведомления</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">Email-уведомления</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-group">
              <h4 className="group-title">Приложение</h4>
              <div className="setting-item">
                <span className="setting-label">Темная тема</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">Язык</span>
                <span className="setting-value">Русский</span>
              </div>
            </div>

            <div className="settings-group">
              <h4 className="group-title">Аккаунт</h4>
              <button className="setting-button">
                <span className="button-icon">🔒</span>
                Изменить пароль
              </button>
              <button className="setting-button">
                <span className="button-icon">📧</span>
                Изменить email
              </button>
              <button className="setting-button danger" onClick={handleLogout}>
                <span className="button-icon">🚪</span>
                Выйти из аккаунта
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
