"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MobileLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешный вход
        router.push("/mobile-app");
      } else {
        setError(data.error || "Ошибка входа");
      }
    } catch (error) {
      setError("Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
          <h2 className="auth-title">Добро пожаловать!</h2>
          <p className="auth-subtitle">Войдите в свой аккаунт</p>
        </div>

        {/* Форма входа */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

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
            <label className="form-label">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Введите пароль"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox" />
              <span className="checkbox-text">Запомнить меня</span>
            </label>
            <Link href="/mobile-app/forgot" className="forgot-link">
              Забыли пароль?
            </Link>
          </div>

          <button
            type="submit"
            className={`auth-button primary ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        {/* Дополнительные опции */}
        <div className="auth-divider">
          <span className="divider-text">или</span>
        </div>

        <div className="social-auth">
          <button className="social-button google">
            <span className="social-icon">G</span>
            Войти через Google
          </button>
          <button className="social-button apple">
            <span className="social-icon">🍎</span>
            Войти через Apple
          </button>
        </div>

        {/* Ссылка на регистрацию */}
        <div className="auth-footer">
          <p className="footer-text">
            Нет аккаунта?{" "}
            <Link href="/mobile-app/register" className="footer-link">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
