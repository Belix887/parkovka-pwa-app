"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  spotId: string;
  spotTitle: string;
  spotAddress: string;
  spotImage: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  vehicleType: string;
  specialRequests?: string;
  createdAt: string;
  owner: {
    name: string;
    phone: string;
    avatar?: string;
  };
}

interface BookingStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
}

export default function MobileBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      // Имитация загрузки бронирований
      setTimeout(() => {
        const mockBookings: Booking[] = [
          {
            id: "1",
            spotId: "1",
            spotTitle: "Парковка у Красной площади",
            spotAddress: "Красная площадь, 1, Москва",
            spotImage: "/api/placeholder/400/300",
            startTime: "2024-01-20T10:00:00",
            endTime: "2024-01-20T12:00:00",
            totalPrice: 400,
            status: "active",
            vehicleType: "Легковой автомобиль",
            specialRequests: "Нужен широкий въезд",
            createdAt: "2024-01-19T15:30:00",
            owner: {
              name: "Анна Петрова",
              phone: "+7 (999) 123-45-67",
            },
          },
          {
            id: "2",
            spotId: "2",
            spotTitle: "Крытая парковка в ТЦ",
            spotAddress: "Тверская, 15, Москва",
            spotImage: "/api/placeholder/400/300",
            startTime: "2024-01-18T14:00:00",
            endTime: "2024-01-18T16:00:00",
            totalPrice: 300,
            status: "completed",
            vehicleType: "Внедорожник",
            createdAt: "2024-01-17T12:00:00",
            owner: {
              name: "Михаил Иванов",
              phone: "+7 (999) 987-65-43",
            },
          },
          {
            id: "3",
            spotId: "3",
            spotTitle: "Парковка у парка",
            spotAddress: "Парк Горького, Москва",
            spotImage: "/api/placeholder/400/300",
            startTime: "2024-01-22T09:00:00",
            endTime: "2024-01-22T11:00:00",
            totalPrice: 200,
            status: "pending",
            vehicleType: "Легковой автомобиль",
            createdAt: "2024-01-21T20:00:00",
            owner: {
              name: "Елена Смирнова",
              phone: "+7 (999) 555-44-33",
            },
          },
          {
            id: "4",
            spotId: "4",
            spotTitle: "Парковка у ВДНХ",
            spotAddress: "Проспект Мира, 119, Москва",
            spotImage: "/api/placeholder/400/300",
            startTime: "2024-01-15T13:00:00",
            endTime: "2024-01-15T15:00:00",
            totalPrice: 160,
            status: "cancelled",
            vehicleType: "Мотоцикл",
            createdAt: "2024-01-14T18:00:00",
            owner: {
              name: "Дмитрий Козлов",
              phone: "+7 (999) 777-88-99",
            },
          },
        ];

        setBookings(mockBookings);
        
        // Расчет статистики
        const totalSpent = mockBookings
          .filter(b => b.status === "completed")
          .reduce((sum, b) => sum + b.totalPrice, 0);
        
        setStats({
          total: mockBookings.length,
          active: mockBookings.filter(b => b.status === "active").length,
          completed: mockBookings.filter(b => b.status === "completed").length,
          cancelled: mockBookings.filter(b => b.status === "cancelled").length,
          totalSpent,
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Имитация отмены бронирования
      setTimeout(() => {
        setBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: "cancelled" as const }
              : booking
          )
        );
        setShowCancelModal(false);
        setSelectedBooking(null);
      }, 1000);
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: "Ожидает подтверждения",
      confirmed: "Подтверждено",
      active: "Активно",
      completed: "Завершено",
      cancelled: "Отменено",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      active: "#10b981",
      completed: "#6b7280",
      cancelled: "#ef4444",
    };
    return colorMap[status as keyof typeof colorMap] || "#6b7280";
  };

  const getStatusIcon = (status: string) => {
    const iconMap = {
      pending: "⏳",
      confirmed: "✅",
      active: "🚗",
      completed: "✔️",
      cancelled: "❌",
    };
    return iconMap[status as keyof typeof iconMap] || "📋";
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  if (loading) {
    return (
      <div className="mobile-bookings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка бронирований...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-bookings-page">
      {/* Заголовок */}
      <div className="bookings-header">
        <div className="header-top">
          <Link href="/mobile-app/profile" className="back-button">
            <span className="back-icon">←</span>
          </Link>
          <h1 className="page-title">Мои бронирования</h1>
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* Статистика */}
      <div className="bookings-stats">
        <div className="stat-item">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Всего</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🚗</div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Активных</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">✔️</div>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Завершено</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.totalSpent.toLocaleString()}₽</div>
          <div className="stat-label">Потрачено</div>
        </div>
      </div>

      {/* Табы */}
      <div className="bookings-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Все ({stats.total})
        </button>
        <button
          className={`tab-button ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Активные ({stats.active})
        </button>
        <button
          className={`tab-button ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Завершенные ({stats.completed})
        </button>
        <button
          className={`tab-button ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Отмененные ({stats.cancelled})
        </button>
      </div>

      {/* Список бронирований */}
      <div className="bookings-content">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Нет бронирований</h3>
            <p>
              {activeTab === "all" 
                ? "У вас пока нет бронирований" 
                : `Нет бронирований со статусом "${getStatusText(activeTab)}"`
              }
            </p>
            <Link href="/mobile-app/catalog" className="cta-button">
              Найти парковку
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-image">
                  <img src={booking.spotImage} alt={booking.spotTitle} />
                  <div className="booking-status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                    <span className="status-icon">{getStatusIcon(booking.status)}</span>
                    <span className="status-text">{getStatusText(booking.status)}</span>
                  </div>
                </div>
                
                <div className="booking-info">
                  <h3 className="booking-title">{booking.spotTitle}</h3>
                  <div className="booking-address">
                    <span className="address-icon">📍</span>
                    {booking.spotAddress}
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-icon">🕐</span>
                      <span className="detail-text">
                        {formatDate(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">🚗</span>
                      <span className="detail-text">{booking.vehicleType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">💰</span>
                      <span className="detail-text">{booking.totalPrice}₽</span>
                    </div>
                    {booking.specialRequests && (
                      <div className="detail-row">
                        <span className="detail-icon">💬</span>
                        <span className="detail-text">{booking.specialRequests}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="booking-owner">
                    <div className="owner-info">
                      <div className="owner-avatar">
                        {booking.owner.avatar ? (
                          <img src={booking.owner.avatar} alt={booking.owner.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {booking.owner.name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="owner-details">
                        <div className="owner-name">{booking.owner.name}</div>
                        <div className="owner-phone">{booking.owner.phone}</div>
                      </div>
                    </div>
                    <button className="contact-owner-btn">
                      <span className="contact-icon">📞</span>
                    </button>
                  </div>
                </div>
                
                <div className="booking-actions">
                  <button 
                    className="action-button secondary"
                    onClick={() => router.push(`/mobile-app/spots/${booking.spotId}`)}
                  >
                    Подробнее
                  </button>
                  {(booking.status === "active" || booking.status === "pending") && (
                    <button 
                      className="action-button danger"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                    >
                      Отменить
                    </button>
                  )}
                  {booking.status === "completed" && (
                    <button className="action-button primary">
                      Оценить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно отмены */}
      {showCancelModal && selectedBooking && (
        <div className="cancel-modal">
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Отменить бронирование</h3>
              <button
                className="modal-close"
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>Вы уверены, что хотите отменить бронирование?</p>
              <div className="booking-summary">
                <div className="summary-item">
                  <span className="summary-label">Место:</span>
                  <span className="summary-value">{selectedBooking.spotTitle}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Время:</span>
                  <span className="summary-value">
                    {formatDate(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Стоимость:</span>
                  <span className="summary-value">{selectedBooking.totalPrice}₽</span>
                </div>
              </div>
              
              <div className="cancellation-warning">
                <span className="warning-icon">⚠️</span>
                <p>При отмене менее чем за 2 часа до начала бронирования может взиматься штраф</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="modal-button secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Не отменять
              </button>
              <button
                className="modal-button danger"
                onClick={() => handleCancelBooking(selectedBooking.id)}
              >
                Отменить бронирование
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
