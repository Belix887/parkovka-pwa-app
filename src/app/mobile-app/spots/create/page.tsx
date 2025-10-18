"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SpotForm {
  title: string;
  description: string;
  address: string;
  pricePerHour: string;
  photos: File[];
  features: {
    covered: boolean;
    guarded: boolean;
    camera: boolean;
    evCharging: boolean;
    disabledAccessible: boolean;
    wideEntrance: boolean;
  };
  rules: string[];
  coordinates: {
    lat: string;
    lng: string;
  };
}

export default function MobileCreateSpotPage() {
  const [formData, setFormData] = useState<SpotForm>({
    title: "",
    description: "",
    address: "",
    pricePerHour: "",
    photos: [],
    features: {
      covered: false,
      guarded: false,
      camera: false,
      evCharging: false,
      disabledAccessible: false,
      wideEntrance: false,
    },
    rules: [""],
    coordinates: {
      lat: "",
      lng: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFeatureChange = (feature: keyof SpotForm["features"]) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: !formData.features[feature],
      },
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({
        ...formData,
        photos: [...formData.photos, ...files],
      });
    }
  };

  const removePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData({
      ...formData,
      rules: newRules,
    });
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, ""],
    });
  };

  const removeRule = (index: number) => {
    if (formData.rules.length > 1) {
      setFormData({
        ...formData,
        rules: formData.rules.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Валидация
      if (!formData.title || !formData.description || !formData.address || !formData.pricePerHour) {
        setError("Заполните все обязательные поля");
        setLoading(false);
        return;
      }

      // Имитация создания парковочного места
      setTimeout(() => {
        setLoading(false);
        router.push("/mobile-app/profile?spotCreated=true");
      }, 2000);
    } catch (error) {
      setError("Ошибка при создании парковочного места");
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (step: number) => {
    const titles = {
      1: "Основная информация",
      2: "Особенности и фото",
      3: "Правила и расположение",
      4: "Проверка и публикация",
    };
    return titles[step as keyof typeof titles];
  };

  return (
    <div className="mobile-create-spot-page">
      {/* Заголовок */}
      <div className="create-header">
        <div className="header-top">
          <Link href="/mobile-app/profile" className="back-button">
            <span className="back-icon">←</span>
          </Link>
          <h1 className="page-title">Сдать место</h1>
          <div className="header-spacer"></div>
        </div>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>
        
        <div className="step-info">
          <span className="step-number">Шаг {currentStep} из {totalSteps}</span>
          <span className="step-title">{getStepTitle(currentStep)}</span>
        </div>
      </div>

      {/* Форма */}
      <form className="create-form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Шаг 1: Основная информация */}
        {currentStep === 1 && (
          <div className="form-step">
            <div className="form-group">
              <label className="form-label">Название места *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Например: Парковка у Красной площади"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Описание *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Опишите особенности вашего парковочного места..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Адрес *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Улица, дом, город"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Цена за час (₽) *</label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleInputChange}
                className="form-input"
                placeholder="200"
                min="50"
                max="1000"
                required
              />
            </div>
          </div>
        )}

        {/* Шаг 2: Особенности и фото */}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="form-group">
              <label className="form-label">Особенности</label>
              <div className="features-grid">
                <label className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.features.covered}
                    onChange={() => handleFeatureChange("covered")}
                  />
                  <span className="checkbox-text">🏠 Крытая</span>
                </label>
                <label className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.features.guarded}
                    onChange={() => handleFeatureChange("guarded")}
                  />
                  <span className="checkbox-text">🛡️ Охраняемая</span>
                </label>
                <label className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.features.camera}
                    onChange={() => handleFeatureChange("camera")}
                  />
                  <span className="checkbox-text">📹 Камеры</span>
                </label>
                <label className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.features.evCharging}
                    onChange={() => handleFeatureChange("evCharging")}
                  />
                  <span className="checkbox-text">🔌 Зарядка ЭВ</span>
                </label>
                <label className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.features.disabledAccessible}
                    onChange={() => handleFeatureChange("disabledAccessible")}
                  />
                  <span className="checkbox-text">♿ Для инвалидов</span>
                </label>
                <label className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.features.wideEntrance}
                    onChange={() => handleFeatureChange("wideEntrance")}
                  />
                  <span className="checkbox-text">🚛 Широкий въезд</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Фотографии</label>
              <div className="photo-upload">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="photo-input"
                />
                <label htmlFor="photo-upload" className="photo-upload-button">
                  <span className="upload-icon">📷</span>
                  Добавить фото
                </label>
              </div>
              
              {formData.photos.length > 0 && (
                <div className="photo-preview">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={URL.createObjectURL(photo)} alt={`Фото ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => removePhoto(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Шаг 3: Правила и расположение */}
        {currentStep === 3 && (
          <div className="form-step">
            <div className="form-group">
              <label className="form-label">Правила использования</label>
              {formData.rules.map((rule, index) => (
                <div key={index} className="rule-input-group">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    className="form-input"
                    placeholder="Например: Соблюдайте правила парковки"
                  />
                  {formData.rules.length > 1 && (
                    <button
                      type="button"
                      className="remove-rule"
                      onClick={() => removeRule(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-rule-button"
                onClick={addRule}
              >
                + Добавить правило
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Координаты (опционально)</label>
              <div className="coordinates-row">
                <input
                  type="number"
                  name="lat"
                  value={formData.coordinates.lat}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Широта"
                  step="any"
                />
                <input
                  type="number"
                  name="lng"
                  value={formData.coordinates.lng}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Долгота"
                  step="any"
                />
              </div>
              <p className="form-hint">
                Координаты помогут точнее отобразить место на карте
              </p>
            </div>
          </div>
        )}

        {/* Шаг 4: Проверка и публикация */}
        {currentStep === 4 && (
          <div className="form-step">
            <div className="preview-section">
              <h3 className="preview-title">Предварительный просмотр</h3>
              
              <div className="spot-preview">
                <div className="preview-header">
                  <h4 className="preview-name">{formData.title || "Название места"}</h4>
                  <div className="preview-price">
                    {formData.pricePerHour ? `${formData.pricePerHour} ₽/час` : "Цена не указана"}
                  </div>
                </div>
                
                <div className="preview-address">
                  <span className="address-icon">📍</span>
                  {formData.address || "Адрес не указан"}
                </div>
                
                <div className="preview-description">
                  {formData.description || "Описание не указано"}
                </div>
                
                <div className="preview-features">
                  {Object.entries(formData.features)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => (
                      <span key={key} className="feature-tag">
                        {key === "covered" && "🏠 Крытая"}
                        {key === "guarded" && "🛡️ Охраняемая"}
                        {key === "camera" && "📹 Камеры"}
                        {key === "evCharging" && "🔌 Зарядка ЭВ"}
                        {key === "disabledAccessible" && "♿ Для инвалидов"}
                        {key === "wideEntrance" && "🚛 Широкий въезд"}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Навигация по шагам */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="nav-button secondary"
              onClick={prevStep}
            >
              Назад
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              className="nav-button primary"
              onClick={nextStep}
            >
              Далее
            </button>
          ) : (
            <button
              type="submit"
              className={`nav-button primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Публикация...
                </>
              ) : (
                "Опубликовать место"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
