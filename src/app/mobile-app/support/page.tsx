"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SupportCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function MobileSupportPage() {
  const [activeTab, setActiveTab] = useState<"help" | "faq" | "contact" | "feedback">("help");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    comment: "",
    suggestions: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const supportCategories: SupportCategory[] = [
    {
      id: "booking",
      title: "Бронирование",
      icon: "📅",
      description: "Помощь с бронированием парковочных мест",
    },
    {
      id: "payment",
      title: "Оплата",
      icon: "💳",
      description: "Вопросы по оплате и возврату средств",
    },
    {
      id: "account",
      title: "Аккаунт",
      icon: "👤",
      description: "Управление профилем и настройками",
    },
    {
      id: "technical",
      title: "Техническая поддержка",
      icon: "🔧",
      description: "Проблемы с приложением и сайтом",
    },
    {
      id: "safety",
      title: "Безопасность",
      icon: "🛡️",
      description: "Безопасность данных и конфиденциальность",
    },
    {
      id: "general",
      title: "Общие вопросы",
      icon: "❓",
      description: "Другие вопросы и предложения",
    },
  ];

  const faqItems: FAQItem[] = [
    {
      id: "1",
      question: "Как забронировать парковочное место?",
      answer: "Выберите место на карте или в каталоге, укажите дату и время, заполните данные о транспорте и подтвердите бронирование.",
      category: "booking",
    },
    {
      id: "2",
      question: "Можно ли отменить бронирование?",
      answer: "Да, вы можете отменить бронирование в разделе 'Мои бронирования'. При отмене менее чем за 2 часа может взиматься штраф.",
      category: "booking",
    },
    {
      id: "3",
      question: "Какие способы оплаты доступны?",
      answer: "Мы принимаем карты Visa, MasterCard, МИР, а также платежи через Apple Pay и Google Pay.",
      category: "payment",
    },
    {
      id: "4",
      question: "Как изменить пароль?",
      answer: "Перейдите в Профиль → Настройки → Изменить пароль. Введите текущий пароль и новый пароль.",
      category: "account",
    },
    {
      id: "5",
      question: "Приложение не работает, что делать?",
      answer: "Попробуйте перезапустить приложение, обновить его до последней версии или очистить кэш в настройках.",
      category: "technical",
    },
    {
      id: "6",
      question: "Безопасны ли мои данные?",
      answer: "Да, мы используем современные методы шифрования и не передаем ваши данные третьим лицам без согласия.",
      category: "safety",
    },
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Имитация отправки сообщения
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        setContactForm({
          name: "",
          email: "",
          subject: "",
          message: "",
          category: "general",
        });
      }, 2000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Имитация отправки отзыва
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        setFeedbackForm({
          rating: 0,
          comment: "",
          suggestions: "",
        });
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setLoading(false);
    }
  };

  const filteredFAQ = selectedCategory 
    ? faqItems.filter(item => item.category === selectedCategory)
    : faqItems;

  return (
    <div className="mobile-support-page">
      {/* Заголовок */}
      <div className="support-header">
        <div className="header-top">
          <Link href="/mobile-app/profile" className="back-button">
            <span className="back-icon">←</span>
          </Link>
          <h1 className="page-title">Поддержка</h1>
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* Табы */}
      <div className="support-tabs">
        <button
          className={`tab-button ${activeTab === "help" ? "active" : ""}`}
          onClick={() => setActiveTab("help")}
        >
          <span className="tab-icon">🆘</span>
          Помощь
        </button>
        <button
          className={`tab-button ${activeTab === "faq" ? "active" : ""}`}
          onClick={() => setActiveTab("faq")}
        >
          <span className="tab-icon">❓</span>
          FAQ
        </button>
        <button
          className={`tab-button ${activeTab === "contact" ? "active" : ""}`}
          onClick={() => setActiveTab("contact")}
        >
          <span className="tab-icon">📞</span>
          Связаться
        </button>
        <button
          className={`tab-button ${activeTab === "feedback" ? "active" : ""}`}
          onClick={() => setActiveTab("feedback")}
        >
          <span className="tab-icon">💬</span>
          Отзыв
        </button>
      </div>

      {/* Контент табов */}
      <div className="support-content">
        {/* Помощь */}
        {activeTab === "help" && (
          <div className="help-section">
            <h2 className="section-title">Как мы можем помочь?</h2>
            <div className="help-categories">
              {supportCategories.map((category) => (
                <div
                  key={category.id}
                  className="help-category"
                  onClick={() => {
                    setActiveTab("faq");
                    setSelectedCategory(category.id);
                  }}
                >
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-info">
                    <h3 className="category-title">{category.title}</h3>
                    <p className="category-description">{category.description}</p>
                  </div>
                  <div className="category-arrow">→</div>
                </div>
              ))}
            </div>

            <div className="quick-help">
              <h3 className="quick-help-title">Быстрая помощь</h3>
              <div className="quick-help-items">
                <div className="quick-help-item">
                  <span className="quick-icon">📞</span>
                  <div className="quick-info">
                    <div className="quick-title">Телефон поддержки</div>
                    <div className="quick-subtitle">+7 (800) 123-45-67</div>
                  </div>
                </div>
                <div className="quick-help-item">
                  <span className="quick-icon">📧</span>
                  <div className="quick-info">
                    <div className="quick-title">Email поддержки</div>
                    <div className="quick-subtitle">support@parkovka.ru</div>
                  </div>
                </div>
                <div className="quick-help-item">
                  <span className="quick-icon">💬</span>
                  <div className="quick-info">
                    <div className="quick-title">Онлайн чат</div>
                    <div className="quick-subtitle">Доступен 24/7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === "faq" && (
          <div className="faq-section">
            <div className="faq-header">
              <h2 className="section-title">Часто задаваемые вопросы</h2>
              {selectedCategory && (
                <button
                  className="clear-filter-btn"
                  onClick={() => setSelectedCategory(null)}
                >
                  Показать все
                </button>
              )}
            </div>

            <div className="faq-filters">
              {supportCategories.map((category) => (
                <button
                  key={category.id}
                  className={`faq-filter ${selectedCategory === category.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="filter-icon">{category.icon}</span>
                  {category.title}
                </button>
              ))}
            </div>

            <div className="faq-list">
              {filteredFAQ.map((item) => (
                <div key={item.id} className="faq-item">
                  <div className="faq-question">
                    <span className="question-icon">❓</span>
                    <span className="question-text">{item.question}</span>
                  </div>
                  <div className="faq-answer">
                    <span className="answer-icon">💡</span>
                    <span className="answer-text">{item.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Контактная форма */}
        {activeTab === "contact" && (
          <div className="contact-section">
            <h2 className="section-title">Связаться с нами</h2>
            
            {submitted ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Сообщение отправлено!</h3>
                <p>Мы получили ваше сообщение и ответим в течение 24 часов.</p>
                <button
                  className="new-message-btn"
                  onClick={() => setSubmitted(false)}
                >
                  Отправить новое сообщение
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label className="form-label">Имя *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="form-input"
                    placeholder="Введите ваш email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Категория</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                    className="form-select"
                  >
                    {supportCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Тема *</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="form-input"
                    placeholder="Краткое описание проблемы"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Сообщение *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="form-textarea"
                    placeholder="Подробно опишите вашу проблему или вопрос"
                    rows={5}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`submit-button ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Отправка...
                    </>
                  ) : (
                    "Отправить сообщение"
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Форма отзыва */}
        {activeTab === "feedback" && (
          <div className="feedback-section">
            <h2 className="section-title">Оставить отзыв</h2>
            
            {submitted ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Спасибо за отзыв!</h3>
                <p>Ваш отзыв поможет нам улучшить сервис.</p>
                <button
                  className="new-feedback-btn"
                  onClick={() => setSubmitted(false)}
                >
                  Оставить новый отзыв
                </button>
              </div>
            ) : (
              <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label className="form-label">Оцените приложение *</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-button ${star <= feedbackForm.rating ? "active" : ""}`}
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <p className="rating-text">
                    {feedbackForm.rating === 0 && "Выберите оценку"}
                    {feedbackForm.rating === 1 && "Очень плохо"}
                    {feedbackForm.rating === 2 && "Плохо"}
                    {feedbackForm.rating === 3 && "Нормально"}
                    {feedbackForm.rating === 4 && "Хорошо"}
                    {feedbackForm.rating === 5 && "Отлично"}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Комментарий</label>
                  <textarea
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    className="form-textarea"
                    placeholder="Расскажите о вашем опыте использования приложения"
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Предложения по улучшению</label>
                  <textarea
                    value={feedbackForm.suggestions}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, suggestions: e.target.value })}
                    className="form-textarea"
                    placeholder="Что бы вы хотели улучшить в приложении?"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className={`submit-button ${loading ? "loading" : ""}`}
                  disabled={loading || feedbackForm.rating === 0}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Отправка...
                    </>
                  ) : (
                    "Отправить отзыв"
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
