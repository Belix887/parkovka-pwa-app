"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MobileRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError("Необходимо согласиться с условиями использования");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешная регистрация
        router.push("/mobile-app/login?registered=true");
      } else {
        setError(data.error || "Ошибка регистрации");
      }
    } catch (error) {
      setError("Произошла ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="mobile-auth-page">
      <div className="auth-container">
        {/* Заголовок */}
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">🚗</div>
            <h1 className="logo-text">Парковка</h1>
          </div>
          <h2 className="auth-title">Создать аккаунт</h2>
          <p className="auth-subtitle">Присоединяйтесь к нашему сообществу</p>
        </div>

        {/* Форма регистрации */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Имя</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Введите ваш email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Телефон</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Подтвердите пароль</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Повторите пароль"
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="checkbox"
                required
              />
              <span className="checkbox-text">
                Я согласен с{" "}
                <Link href="/terms" className="terms-link">
                  условиями использования
                </Link>{" "}
                и{" "}
                <Link href="/privacy" className="terms-link">
                  политикой конфиденциальности
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={`auth-button primary ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Регистрация...
              </>
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        {/* Дополнительные опции */}
        <div className="auth-divider">
          <span className="divider-text">или</span>
        </div>

        <div className="social-auth">
          <button className="social-button google">
            <span className="social-icon">🔍</span>
            Регистрация через Google
          </button>
          <button className="social-button apple">
            <span className="social-icon">🍎</span>
            Регистрация через Apple
          </button>
        </div>

        {/* Ссылка на вход */}
        <div className="auth-footer">
          <p className="footer-text">
            Уже есть аккаунт?{" "}
            <Link href="/mobile-app/login" className="footer-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
