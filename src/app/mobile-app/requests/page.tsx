"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BookingRequest {
  id: string;
  spotId: string;
  spotTitle: string;
  spotAddress: string;
  spotImage: string;
  user: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    rating: number;
  };
  startTime: string;
  endTime: string;
  totalPrice: number;
  vehicleType: string;
  specialRequests?: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  message?: string;
}

interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  totalEarnings: number;
}

export default function MobileRequestsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "declined">("all");
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "decline">("approve");
  const router = useRouter();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Имитация загрузки заявок
      setTimeout(() => {
        const mockRequests: BookingRequest[] = [
          {
            id: "1",
            spotId: "1",
            spotTitle: "Парковка у Красной площади",
            spotAddress: "Красная площадь, 1, Москва",
            spotImage: "/api/placeholder/400/300",
            user: {
              name: "Иван Петров",
              email: "ivan@example.com",
              phone: "+7 (999) 123-45-67",
              rating: 4.8,
            },
            startTime: "2024-01-20T10:00:00",
            endTime: "2024-01-20T12:00:00",
            totalPrice: 400,
            vehicleType: "Легковой автомобиль",
            specialRequests: "Нужен широкий въезд",
            status: "pending",
            createdAt: "2024-01-19T15:30:00",
            message: "Здравствуйте! Хотел бы забронировать место на завтра утром.",
          },
          {
            id: "2",
            spotId: "1",
            spotTitle: "Парковка у Красной площади",
            spotAddress: "Красная площадь, 1, Москва",
            spotImage: "/api/placeholder/400/300",
            user: {
              name: "Мария Сидорова",
              email: "maria@example.com",
              phone: "+7 (999) 987-65-43",
              rating: 4.9,
            },
            startTime: "2024-01-18T14:00:00",
            endTime: "2024-01-18T16:00:00",
            totalPrice: 300,
            vehicleType: "Внедорожник",
            status: "approved",
            createdAt: "2024-01-17T12:00:00",
          },
          {
            id: "3",
            spotId: "1",
            spotTitle: "Парковка у Красной площади",
            spotAddress: "Красная площадь, 1, Москва",
            spotImage: "/api/placeholder/400/300",
            user: {
              name: "Алексей Козлов",
              email: "alex@example.com",
              phone: "+7 (999) 555-44-33",
              rating: 4.2,
            },
            startTime: "2024-01-22T09:00:00",
            endTime: "2024-01-22T11:00:00",
            totalPrice: 200,
            vehicleType: "Легковой автомобиль",
            status: "declined",
            createdAt: "2024-01-21T20:00:00",
            message: "Извините, но в это время место уже занято.",
          },
        ];

        setRequests(mockRequests);
        
        // Расчет статистики
        const totalEarnings = mockRequests
          .filter(r => r.status === "approved")
          .reduce((sum, r) => sum + r.totalPrice, 0);
        
        setStats({
          total: mockRequests.length,
          pending: mockRequests.filter(r => r.status === "pending").length,
          approved: mockRequests.filter(r => r.status === "approved").length,
          declined: mockRequests.filter(r => r.status === "declined").length,
          totalEarnings,
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading requests:", error);
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: "approve" | "decline") => {
    try {
      // Имитация обработки заявки
      setTimeout(() => {
        setRequests(prev => 
          prev.map(request => 
            request.id === requestId 
              ? { ...request, status: action === "approve" ? "approved" : "declined" }
              : request
          )
        );
        setShowActionModal(false);
        setSelectedRequest(null);
      }, 1000);
    } catch (error) {
      console.error("Error processing request:", error);
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
      approved: "Одобрено",
      declined: "Отклонено",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: "#f59e0b",
      approved: "#10b981",
      declined: "#ef4444",
    };
    return colorMap[status as keyof typeof colorMap] || "#6b7280";
  };

  const getStatusIcon = (status: string) => {
    const iconMap = {
      pending: "⏳",
      approved: "✅",
      declined: "❌",
    };
    return iconMap[status as keyof typeof iconMap] || "📋";
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  if (loading) {
    return (
      <div className="mobile-requests-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка заявок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-requests-page">
      {/* Заголовок */}
      <div className="requests-header">
        <div className="header-top">
          <Link href="/mobile-app/profile" className="back-button">
            <span className="back-icon">←</span>
          </Link>
          <h1 className="page-title">Заявки на бронирование</h1>
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* Статистика */}
      <div className="requests-stats">
        <div className="stat-item">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Всего</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Ожидают</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Одобрено</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.totalEarnings.toLocaleString()}₽</div>
          <div className="stat-label">Заработано</div>
        </div>
      </div>

      {/* Табы */}
      <div className="requests-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Все ({stats.total})
        </button>
        <button
          className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Ожидают ({stats.pending})
        </button>
        <button
          className={`tab-button ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          Одобрено ({stats.approved})
        </button>
        <button
          className={`tab-button ${activeTab === "declined" ? "active" : ""}`}
          onClick={() => setActiveTab("declined")}
        >
          Отклонено ({stats.declined})
        </button>
      </div>

      {/* Список заявок */}
      <div className="requests-content">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Нет заявок</h3>
            <p>
              {activeTab === "all" 
                ? "У вас пока нет заявок на бронирование" 
                : `Нет заявок со статусом "${getStatusText(activeTab)}"`
              }
            </p>
            <Link href="/mobile-app/spots/create" className="cta-button">
              Создать парковку
            </Link>
          </div>
        ) : (
          <div className="requests-list">
            {filteredRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-image">
                  <img src={request.spotImage} alt={request.spotTitle} />
                  <div className="request-status-badge" style={{ backgroundColor: getStatusColor(request.status) }}>
                    <span className="status-icon">{getStatusIcon(request.status)}</span>
                    <span className="status-text">{getStatusText(request.status)}</span>
                  </div>
                </div>
                
                <div className="request-info">
                  <h3 className="request-title">{request.spotTitle}</h3>
                  <div className="request-address">
                    <span className="address-icon">📍</span>
                    {request.spotAddress}
                  </div>
                  
                  {/* Информация о пользователе */}
                  <div className="request-user">
                    <div className="user-info">
                      <div className="user-avatar">
                        {request.user.avatar ? (
                          <img src={request.user.avatar} alt={request.user.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {request.user.name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{request.user.name}</div>
                        <div className="user-rating">
                          <span className="rating-stars">⭐</span>
                          <span className="rating-value">{request.user.rating}</span>
                        </div>
                        <div className="user-contact">
                          <span className="contact-icon">📞</span>
                          {request.user.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Детали бронирования */}
                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-icon">🕐</span>
                      <span className="detail-text">
                        {formatDate(request.startTime)} - {formatTime(request.endTime)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">🚗</span>
                      <span className="detail-text">{request.vehicleType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">💰</span>
                      <span className="detail-text">{request.totalPrice}₽</span>
                    </div>
                    {request.specialRequests && (
                      <div className="detail-row">
                        <span className="detail-icon">💬</span>
                        <span className="detail-text">{request.specialRequests}</span>
                      </div>
                    )}
                    {request.message && (
                      <div className="request-message">
                        <span className="message-icon">💬</span>
                        <span className="message-text">{request.message}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="request-actions">
                  {request.status === "pending" && (
                    <>
                      <button 
                        className="action-button success"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType("approve");
                          setShowActionModal(true);
                        }}
                      >
                        Одобрить
                      </button>
                      <button 
                        className="action-button danger"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType("decline");
                          setShowActionModal(true);
                        }}
                      >
                        Отклонить
                      </button>
                    </>
                  )}
                  <button 
                    className="action-button secondary"
                    onClick={() => router.push(`/mobile-app/spots/${request.spotId}`)}
                  >
                    Место
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно действий */}
      {showActionModal && selectedRequest && (
        <div className="action-modal">
          <div className="modal-overlay" onClick={() => setShowActionModal(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType === "approve" ? "Одобрить заявку" : "Отклонить заявку"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowActionModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="request-summary">
                <div className="summary-item">
                  <span className="summary-label">Пользователь:</span>
                  <span className="summary-value">{selectedRequest.user.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Место:</span>
                  <span className="summary-value">{selectedRequest.spotTitle}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Время:</span>
                  <span className="summary-value">
                    {formatDate(selectedRequest.startTime)} - {formatTime(selectedRequest.endTime)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Стоимость:</span>
                  <span className="summary-value">{selectedRequest.totalPrice}₽</span>
                </div>
              </div>
              
              {actionType === "approve" ? (
                <div className="approval-info">
                  <span className="info-icon">✅</span>
                  <p>После одобрения пользователь получит подтверждение бронирования</p>
                </div>
              ) : (
                <div className="decline-info">
                  <span className="info-icon">❌</span>
                  <p>Пользователь получит уведомление об отклонении заявки</p>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button
                className="modal-button secondary"
                onClick={() => setShowActionModal(false)}
              >
                Отмена
              </button>
              <button
                className={`modal-button ${actionType === "approve" ? "success" : "danger"}`}
                onClick={() => handleRequestAction(selectedRequest.id, actionType)}
              >
                {actionType === "approve" ? "Одобрить" : "Отклонить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
