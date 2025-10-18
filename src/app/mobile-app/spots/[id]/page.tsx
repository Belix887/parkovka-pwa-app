"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ParkingSpot {
  id: string;
  title: string;
  description: string;
  address: string;
  pricePerHour: number;
  photos: string[];
  features: string[];
  owner: {
    name: string;
    rating: number;
    avatar?: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  availability: {
    isAvailable: boolean;
    nextAvailable?: string;
  };
  rules: string[];
}

interface BookingForm {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  vehicleType: string;
  specialRequests: string;
}

export default function MobileSpotDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    vehicleType: "car",
    specialRequests: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      await loadSpotDetails(id);
    };
    loadData();
  }, [params]);

  const loadSpotDetails = async (spotId: string) => {
    try {
      // Имитация загрузки данных парковочного места
      setTimeout(() => {
        setSpot({
          id: spotId,
          title: "Парковка у Красной площади",
          description: "Удобная парковка в самом центре Москвы, рядом с Красной площадью и ГУМом. Идеально для туристов и деловых встреч. Круглосуточная охрана и видеонаблюдение.",
          address: "Красная площадь, 1, Москва, Россия",
          pricePerHour: 20000, // в копейках
          photos: [
            "/api/placeholder/400/300",
            "/api/placeholder/400/300",
            "/api/placeholder/400/300",
          ],
          features: ["Крытая", "Охраняемая", "Камеры", "Для инвалидов"],
          owner: {
            name: "Анна Петрова",
            rating: 4.9,
            avatar: "",
          },
          coordinates: {
            lat: 55.7539,
            lng: 37.6208,
          },
          availability: {
            isAvailable: true,
          },
          rules: [
            "Соблюдайте правила парковки",
            "Не оставляйте ценные вещи в машине",
            "При возникновении проблем звоните владельцу",
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading spot details:", error);
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setError("");

    try {
      // Имитация создания бронирования
      setTimeout(() => {
        setBookingLoading(false);
        setShowBookingForm(false);
        // Показать уведомление об успешном бронировании
        alert("Бронирование успешно создано!");
      }, 2000);
    } catch (error) {
      setError("Ошибка при создании бронирования");
      setBookingLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value,
    });
  };

  const formatPrice = (priceInKopecks: number) => {
    return `${(priceInKopecks / 100).toLocaleString("ru-RU")} ₽/час`;
  };

  const calculateTotalPrice = () => {
    if (!bookingForm.startDate || !bookingForm.endDate || !bookingForm.startTime || !bookingForm.endTime) {
      return 0;
    }

    const startDateTime = new Date(`${bookingForm.startDate}T${bookingForm.startTime}`);
    const endDateTime = new Date(`${bookingForm.endDate}T${bookingForm.endTime}`);
    const hours = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60));
    
    return hours * (spot?.pricePerHour || 0) / 100;
  };

  if (loading) {
    return (
      <div className="mobile-spot-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка деталей...</p>
        </div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="mobile-spot-details-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Парковка не найдена</h3>
          <p>Запрашиваемая парковка не существует или была удалена</p>
          <Link href="/mobile-app/catalog" className="back-button">
            Вернуться к каталогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-spot-details-page">
      {/* Галерея фотографий */}
      <div className="spot-gallery">
        <div className="main-photo">
          <img src={spot.photos[0]} alt={spot.title} />
          <div className="photo-overlay">
            <button className="photo-counter">
              📷 {spot.photos.length} фото
            </button>
          </div>
        </div>
      </div>

      {/* Основная информация */}
      <div className="spot-info">
        <div className="spot-header">
          <h1 className="spot-title">{spot.title}</h1>
          <div className="spot-price">{formatPrice(spot.pricePerHour)}</div>
        </div>

        <div className="spot-location">
          <span className="location-icon">📍</span>
          <span className="location-text">{spot.address}</span>
        </div>

        <div className="spot-description">
          <p>{spot.description}</p>
        </div>

        {/* Особенности */}
        <div className="spot-features">
          <h3 className="features-title">Особенности</h3>
          <div className="features-grid">
            {spot.features.map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">
                  {feature === "Крытая" && "🏠"}
                  {feature === "Охраняемая" && "🛡️"}
                  {feature === "Камеры" && "📹"}
                  {feature === "Для инвалидов" && "♿"}
                  {feature === "Зарядка ЭВ" && "🔌"}
                  {feature === "Широкий въезд" && "🚛"}
                </span>
                <span className="feature-text">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Владелец */}
        <div className="spot-owner">
          <h3 className="owner-title">Владелец</h3>
          <div className="owner-info">
            <div className="owner-avatar">
              {spot.owner.avatar ? (
                <img src={spot.owner.avatar} alt={spot.owner.name} />
              ) : (
                <div className="avatar-placeholder">
                  {spot.owner.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="owner-details">
              <div className="owner-name">{spot.owner.name}</div>
              <div className="owner-rating">
                <span className="rating-stars">⭐</span>
                <span className="rating-value">{spot.owner.rating}</span>
              </div>
            </div>
            <button className="contact-owner-btn">
              <span className="contact-icon">💬</span>
            </button>
          </div>
        </div>

        {/* Правила */}
        <div className="spot-rules">
          <h3 className="rules-title">Правила</h3>
          <ul className="rules-list">
            {spot.rules.map((rule, index) => (
              <li key={index} className="rule-item">
                <span className="rule-icon">📋</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Карта */}
        <div className="spot-map">
          <h3 className="map-title">Расположение</h3>
          <div className="map-container">
            <div className="map-placeholder">
              <span className="map-icon">🗺️</span>
              <p>Интерактивная карта</p>
              <button className="open-map-btn">
                Открыть в картах
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка бронирования */}
      <div className="booking-footer">
        {spot.availability.isAvailable ? (
          <button
            className="book-button primary"
            onClick={() => setShowBookingForm(true)}
          >
            <span className="book-icon">🚗</span>
            Забронировать место
          </button>
        ) : (
          <div className="unavailable-message">
            <span className="unavailable-icon">⏰</span>
            Место недоступно
            {spot.availability.nextAvailable && (
              <p>Следующая доступность: {spot.availability.nextAvailable}</p>
            )}
          </div>
        )}
      </div>

      {/* Форма бронирования */}
      {showBookingForm && (
        <div className="booking-modal">
          <div className="modal-overlay" onClick={() => setShowBookingForm(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Бронирование места</h3>
              <button
                className="modal-close"
                onClick={() => setShowBookingForm(false)}
              >
                ✕
              </button>
            </div>

            <form className="booking-form" onSubmit={handleBookingSubmit}>
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Дата начала</label>
                  <input
                    type="date"
                    name="startDate"
                    value={bookingForm.startDate}
                    onChange={handleFormChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Время начала</label>
                  <input
                    type="time"
                    name="startTime"
                    value={bookingForm.startTime}
                    onChange={handleFormChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Дата окончания</label>
                  <input
                    type="date"
                    name="endDate"
                    value={bookingForm.endDate}
                    onChange={handleFormChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Время окончания</label>
                  <input
                    type="time"
                    name="endTime"
                    value={bookingForm.endTime}
                    onChange={handleFormChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Тип транспорта</label>
                <select
                  name="vehicleType"
                  value={bookingForm.vehicleType}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  <option value="car">Легковой автомобиль</option>
                  <option value="suv">Внедорожник</option>
                  <option value="truck">Грузовик</option>
                  <option value="motorcycle">Мотоцикл</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Особые пожелания</label>
                <textarea
                  name="specialRequests"
                  value={bookingForm.specialRequests}
                  onChange={handleFormChange}
                  className="form-textarea"
                  placeholder="Дополнительные требования или пожелания"
                  rows={3}
                />
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span className="summary-label">Стоимость за час:</span>
                  <span className="summary-value">{formatPrice(spot.pricePerHour)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Общая стоимость:</span>
                  <span className="summary-value total">
                    {calculateTotalPrice().toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="form-button secondary"
                  onClick={() => setShowBookingForm(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`form-button primary ${bookingLoading ? "loading" : ""}`}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Бронирование...
                    </>
                  ) : (
                    "Подтвердить бронирование"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
