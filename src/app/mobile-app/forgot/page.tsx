"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MobileForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Имитация отправки кода
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setStep("code");
      }, 2000);
    } catch (error) {
      setError("Ошибка при отправке кода");
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Имитация проверки кода
      setTimeout(() => {
        if (code === "123456") {
          setStep("password");
          setError("");
        } else {
          setError("Неверный код подтверждения");
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError("Ошибка при проверке кода");
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      setLoading(false);
      return;
    }

    try {
      // Имитация смены пароля
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          router.push("/mobile-app/login?passwordChanged=true");
        }, 2000);
      }, 2000);
    } catch (error) {
      setError("Ошибка при смене пароля");
      setLoading(false);
    }
  };

  const resendCode = () => {
    setError("");
    setSuccess(false);
    // Имитация повторной отправки
    setTimeout(() => {
      setSuccess(true);
    }, 1000);
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
          
          {step === "email" && (
            <>
              <h2 className="auth-title">Восстановление пароля</h2>
              <p className="auth-subtitle">Введите email для получения кода подтверждения</p>
            </>
          )}
          
          {step === "code" && (
            <>
              <h2 className="auth-title">Код подтверждения</h2>
              <p className="auth-subtitle">Введите код, отправленный на {email}</p>
            </>
          )}
          
          {step === "password" && (
            <>
              <h2 className="auth-title">Новый пароль</h2>
              <p className="auth-subtitle">Придумайте новый пароль для вашего аккаунта</p>
            </>
          )}
        </div>

        {/* Форма ввода email */}
        {step === "email" && (
          <form className="auth-form" onSubmit={handleEmailSubmit}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Введите ваш email"
                required
              />
            </div>

            <button
              type="submit"
              className={`auth-button primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Отправка...
                </>
              ) : (
                "Отправить код"
              )}
            </button>
          </form>
        )}

        {/* Форма ввода кода */}
        {step === "code" && (
          <form className="auth-form" onSubmit={handleCodeSubmit}>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                Код отправлен на ваш email
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Код подтверждения</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="form-input code-input"
                placeholder="Введите 6-значный код"
                maxLength={6}
                required
              />
              <p className="form-hint">Для демонстрации используйте код: 123456</p>
            </div>

            <button
              type="submit"
              className={`auth-button primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Проверка...
                </>
              ) : (
                "Подтвердить код"
              )}
            </button>

            <div className="resend-section">
              <p className="resend-text">Не получили код?</p>
              <button
                type="button"
                className="resend-button"
                onClick={resendCode}
              >
                Отправить повторно
              </button>
            </div>
          </form>
        )}

        {/* Форма нового пароля */}
        {step === "password" && (
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Повторите пароль"
                required
              />
            </div>

            <button
              type="submit"
              className={`auth-button primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Сохранение...
                </>
              ) : (
                "Сохранить пароль"
              )}
            </button>
          </form>
        )}

        {/* Успешное восстановление */}
        {success && step === "password" && (
          <div className="success-container">
            <div className="success-icon-large">✅</div>
            <h3 className="success-title">Пароль успешно изменен!</h3>
            <p className="success-text">Теперь вы можете войти в аккаунт с новым паролем</p>
          </div>
        )}

        {/* Навигация */}
        <div className="auth-navigation">
          {step === "code" && (
            <button
              className="back-step-button"
              onClick={() => setStep("email")}
            >
              ← Назад к email
            </button>
          )}
          
          {step === "password" && (
            <button
              className="back-step-button"
              onClick={() => setStep("code")}
            >
              ← Назад к коду
            </button>
          )}
        </div>

        {/* Ссылка на вход */}
        <div className="auth-footer">
          <p className="footer-text">
            Вспомнили пароль?{" "}
            <Link href="/mobile-app/login" className="footer-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
