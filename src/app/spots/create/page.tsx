"use client";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { MotionCard, CardHeader, CardContent, CardFooter } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { AddressAutocomplete } from "@/components/spot/AddressAutocomplete";
import { GeocodeSuggestion } from "@/lib/geocoding";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

interface FieldErrors {
  [key: string]: string;
}

export default function CreateSpotPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [address, setAddress] = useState("");
  const [geoLat, setGeoLat] = useState<number | null>(null);
  const [geoLng, setGeoLng] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([55.751244, 37.618423]);
  const formRef = useRef<HTMLFormElement>(null);
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= 10) {
      showError("Превышен лимит", "Максимум 10 фотографий");
      return;
    }
    try {
      const res = await fetch("/api/uploads/sign", { method: "POST" });
      const data = await res.json();
      if (data.signedUrl) {
        await fetch(data.signedUrl, { method: data.method || 'PUT', headers: data.headers || {}, body: file });
        setPhotos((p) => [...p, data.publicUrl]);
        showInfo("Фото добавлено", "Фотография успешно загружена");
      } else if (data.publicUrl) {
        setPhotos((p) => [...p, data.publicUrl]);
        showInfo("Фото добавлено", "Использован плейсхолдер");
      } else {
        throw new Error("no url");
      }
    } catch (err) {
      showError("Ошибка загрузки", "Не удалось загрузить фото");
    } finally {
      e.currentTarget.value = "";
    }
  }

  const handleAddressSelect = (suggestion: GeocodeSuggestion) => {
    setGeoLat(suggestion.lat);
    setGeoLng(suggestion.lng);
    setMapCenter([suggestion.lat, suggestion.lng]);
    
    // Обновляем скрытые поля формы
    if (formRef.current) {
      const latInput = formRef.current.querySelector('input[name="geoLat"]') as HTMLInputElement;
      const lngInput = formRef.current.querySelector('input[name="geoLng"]') as HTMLInputElement;
      if (latInput) latInput.value = suggestion.lat.toString();
      if (lngInput) lngInput.value = suggestion.lng.toString();
    }
    
    showInfo("Координаты обновлены", "Адрес найден на карте");
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Очищаем предыдущие ошибки
    setFieldErrors({});
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());
    
    // Используем координаты из состояния, если они есть
    const finalGeoLat = geoLat !== null ? geoLat : Number(body.geoLat);
    const finalGeoLng = geoLng !== null ? geoLng : Number(body.geoLng);
    
    // Базовая валидация на клиенте
    const errors: FieldErrors = {};
    
    if (!body.title || String(body.title).trim().length < 3) {
      errors.title = "Название должно содержать минимум 3 символа";
    }
    if (!body.description || String(body.description).trim().length < 30) {
      errors.description = "Описание должно содержать минимум 30 символов";
    }
    const price = Number(body.pricePerHour);
    if (!price || price < 100 || price > 500000) {
      errors.pricePerHour = "Цена должна быть от 1 ₽ (100 коп.) до 5 000 ₽ (500 000 коп.)";
    } else if (price % 50 !== 0) {
      errors.pricePerHour = "Цена должна быть кратна 50 копейкам";
    }
    const sizeL = Number(body.sizeL);
    if (!sizeL || sizeL < 1 || sizeL > 20) {
      errors.sizeL = "Длина должна быть от 1 до 20 метров";
    }
    const sizeW = Number(body.sizeW);
    if (!sizeW || sizeW < 1 || sizeW > 20) {
      errors.sizeW = "Ширина должна быть от 1 до 20 метров";
    }
    const sizeH = Number(body.sizeH);
    if (!sizeH || sizeH < 1 || sizeH > 20) {
      errors.sizeH = "Высота должна быть от 1 до 20 метров";
    }
    const finalAddress = address || String(body.address || "").trim();
    if (!finalAddress || finalAddress.length < 5) {
      errors.address = "Адрес должен содержать минимум 5 символов. Выберите адрес из списка";
    }
    // Проверяем координаты (используем из состояния или из формы)
    const checkGeoLat = finalGeoLat;
    const checkGeoLng = finalGeoLng;
    
    if (!checkGeoLat || checkGeoLat < -90 || checkGeoLat > 90 || Math.abs(checkGeoLat) < 0.000001) {
      errors.geoLat = "Укажите корректную широту. Выберите адрес из списка или укажите координаты вручную";
    }
    if (!checkGeoLng || checkGeoLng < -180 || checkGeoLng > 180 || Math.abs(checkGeoLng) < 0.000001) {
      errors.geoLng = "Укажите корректную долготу. Выберите адрес из списка или укажите координаты вручную";
    }
    if (photos.length === 0) {
      errors.photos = "Добавьте хотя бы одно фото";
    }
    if (!body.rules || String(body.rules).trim().length < 10) {
      errors.rules = "Правила должны содержать минимум 10 символов";
    }
    
    // Если есть ошибки валидации, показываем их и останавливаем отправку
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Прокручиваем к первой ошибке
      const firstErrorField = Object.keys(errors)[0];
      const firstErrorElement = form.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorElement.focus();
      }
      showError("Ошибка валидации", "Проверьте заполнение полей");
      return;
    }
    
    const payload = {
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      pricePerHour: Math.round(price),
      sizeL: Number(sizeL),
      sizeW: Number(sizeW),
      sizeH: Number(sizeH),
      covered: Boolean(body.covered),
      guarded: Boolean(body.guarded),
      camera: Boolean(body.camera),
      evCharging: Boolean(body.evCharging),
      disabledAccessible: Boolean(body.disabledAccessible),
      wideEntrance: Boolean(body.wideEntrance),
      accessType: String(body.accessType),
      rules: String(body.rules).trim(),
      address: address || String(body.address).trim(),
      geoLat: finalGeoLat,
      geoLng: finalGeoLng,
      photos,
    };
    
    setLoading(true);
    try {
      const r = await fetch("/api/spots", { 
        method: "POST", 
        body: JSON.stringify(payload), 
        headers: { "Content-Type": "application/json" } 
      });
      
      if (r.ok) {
        showSuccess("Место создано", "Ваше место отправлено на модерацию");
        form.reset();
        setPhotos([]);
        setFieldErrors({});
        router.push("/profile");
      } else {
        const errorData = await r.json();
        
        // Обрабатываем детальные ошибки валидации от сервера
        if (errorData.details && Array.isArray(errorData.details)) {
          const serverErrors: FieldErrors = {};
          errorData.details.forEach((detail: { path: string; message: string }) => {
            serverErrors[detail.path] = detail.message;
          });
          setFieldErrors(serverErrors);
          
          // Прокручиваем к первой ошибке
          const firstErrorPath = errorData.details[0]?.path;
          if (firstErrorPath) {
            const firstErrorElement = form.querySelector(`[name="${firstErrorPath}"]`) as HTMLElement;
            if (firstErrorElement) {
              firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
              firstErrorElement.focus();
            }
          }
          
          // Показываем все ошибки
          const errorMessages = errorData.details.map((d: { message: string }) => d.message).join(", ");
          showError("Ошибка валидации", errorMessages);
        } else {
          showError("Ошибка создания", errorData.error || "Не удалось создать место");
        }
      }
    } catch (err) {
      showError("Ошибка сети", "Проверьте подключение к интернету");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
      {/* Мобильная навигация */}
      <MobileNavigation />
      
             {/* Основной контент с отступом для мобильной шапки */}
             <div className="pt-14 md:pt-0">
        <div className="container py-6 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Создать парковочное место
            </h1>
            <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-2xl mx-auto">
              Добавьте свое парковочное место и начните зарабатывать на аренде
            </p>
          </div>

          <form ref={formRef} onSubmit={onSubmit} className="space-y-6 md:space-y-8">
            {/* Основная информация */}
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Основная информация" 
                subtitle="Заполните базовые данные о парковочном месте"
                icon="📝"
              />
              <CardContent>
                <div className="space-y-4 md:space-y-6 mobile-form">
                  <Input
                    name="title"
                    label="Название места"
                    placeholder="Например: Удобная парковка в центре"
                    required
                    error={fieldErrors.title}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Описание
                    </label>
                    <textarea 
                      name="description" 
                      placeholder="Опишите особенности вашего парковочного места..."
                      className={`w-full px-4 py-3 bg-[var(--bg-surface)] border rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 mobile-form ${
                        fieldErrors.description ? "border-[var(--accent-error)]" : "border-[var(--border-primary)]"
                      }`}
                      rows={4}
                      required 
                    />
                    {fieldErrors.description && (
                      <p className="mt-2 text-sm text-[var(--accent-error)]">{fieldErrors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="pricePerHour"
                      label="Цена за час (копейки)"
                      type="number"
                      placeholder="10000"
                      required
                      error={fieldErrors.pricePerHour}
                      helperText="Например: 10000 = 100 ₽"
                    />
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Тип доступа
                      </label>
                      <select 
                        name="accessType" 
                        className={`w-full px-4 py-3 bg-[var(--bg-surface)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 mobile-form ${
                          fieldErrors.accessType ? "border-[var(--accent-error)]" : "border-[var(--border-primary)]"
                        }`}
                      >
                        <option value="PRIVATE_GATE">Закрытая территория</option>
                        <option value="STREET">Улица</option>
                        <option value="GARAGE">Гараж</option>
                        <option value="YARD">Двор</option>
                        <option value="OTHER">Другое</option>
                      </select>
                      {fieldErrors.accessType && (
                        <p className="mt-2 text-sm text-[var(--accent-error)]">{fieldErrors.accessType}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <Input
                      name="sizeL"
                      label="Длина (м)"
                      type="number"
                      step="0.1"
                      placeholder="5.0"
                      required
                      error={fieldErrors.sizeL}
                    />
                    <Input
                      name="sizeW"
                      label="Ширина (м)"
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      required
                      error={fieldErrors.sizeW}
                    />
                    <Input
                      name="sizeH"
                      label="Высота (м)"
                      type="number"
                      step="0.1"
                      placeholder="2.2"
                      required
                      error={fieldErrors.sizeH}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Адрес в Москве
                    </label>
                    <AddressAutocomplete
                      value={address}
                      onChange={setAddress}
                      onSelect={handleAddressSelect}
                      placeholder="Начните вводить адрес, например: Красная площадь, 1"
                      error={fieldErrors.address}
                      required
                    />
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      💡 Начните вводить адрес, выберите из списка - координаты заполнятся автоматически
                    </p>
                  </div>

                  {/* Карта с выбранным местом */}
                  {(geoLat !== null && geoLng !== null) && (
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Расположение на карте
                      </label>
                      <div className="rounded-xl overflow-hidden border border-[var(--border-primary)]">
                        <LeafletMap
                          center={mapCenter}
                          spots={[{
                            id: "preview",
                            title: "Ваше место",
                            address: address,
                            pricePerHour: 0,
                            geoLat: geoLat,
                            geoLng: geoLng,
                            covered: false,
                            guarded: false,
                            camera: false,
                            evCharging: false,
                            disabledAccessible: false,
                            wideEntrance: false,
                            photos: [],
                          }]}
                          loadSpots={false}
                        />
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        📍 Координаты: {geoLat.toFixed(6)}, {geoLng.toFixed(6)}
                      </p>
                    </div>
                  )}

                  {/* Скрытые поля для координат (для отправки формы) */}
                  <input type="hidden" name="geoLat" value={geoLat?.toString() || ""} />
                  <input type="hidden" name="geoLng" value={geoLng?.toString() || ""} />
                  
                  {/* Ручной ввод координат (опционально) */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      ⚙️ Указать координаты вручную
                    </summary>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Input
                        name="geoLatManual"
                        label="Широта"
                        type="number"
                        step="any"
                        placeholder="55.7558"
                        value={geoLat?.toString() || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setGeoLat(val);
                            setMapCenter([val, geoLng || 37.6176]);
                          }
                        }}
                        error={fieldErrors.geoLat}
                        helperText="От -90 до 90"
                      />
                      <Input
                        name="geoLngManual"
                        label="Долгота"
                        type="number"
                        step="any"
                        placeholder="37.6176"
                        value={geoLng?.toString() || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setGeoLng(val);
                            setMapCenter([geoLat || 55.751244, val]);
                          }
                        }}
                        error={fieldErrors.geoLng}
                        helperText="От -180 до 180"
                      />
                    </div>
                  </details>
                </div>
              </CardContent>
            </MotionCard>

            {/* Особенности */}
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Особенности места" 
                subtitle="Отметьте доступные удобства"
                icon="✨"
              />
              <CardContent>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[
                    { name: "covered", label: "Крытое", icon: "🏠" },
                    { name: "guarded", label: "Под охраной", icon: "🛡️" },
                    { name: "camera", label: "Видеонаблюдение", icon: "📹" },
                    { name: "evCharging", label: "EV зарядка", icon: "🔌" },
                    { name: "disabledAccessible", label: "Для инвалидов", icon: "♿" },
                    { name: "wideEntrance", label: "Широкий въезд", icon: "🚗" }
                  ].map(({ name, label, icon }) => (
                    <label key={name} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-card)] transition-colors duration-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name={name} 
                        className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-surface)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)] focus:ring-2"
                      />
                      <span className="text-lg">{icon}</span>
                      <span className="text-[var(--text-primary)] font-medium text-sm md:text-base">{label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </MotionCard>

            {/* Фотографии */}
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Фотографии" 
                subtitle="Добавьте до 10 фотографий места"
                icon="📸"
              />
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Фото ${i + 1}`} 
                          className="w-full h-20 md:h-24 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-error)] text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <label className="block w-full">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
                    <Button 
                      type="button" 
                      variant={fieldErrors.photos ? "outline" : "outline"} 
                      icon="📷" 
                      className={`w-full mobile-btn ${
                        fieldErrors.photos ? "border-[var(--accent-error)] text-[var(--accent-error)]" : ""
                      }`}
                    >
                      Добавить фото ({photos.length}/10)
                    </Button>
                  </label>
                  {fieldErrors.photos && (
                    <p className="text-sm text-[var(--accent-error)]">{fieldErrors.photos}</p>
                  )}
                </div>
              </CardContent>
            </MotionCard>

            {/* Правила */}
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Правила и условия" 
                subtitle="Укажите особые требования к арендаторам"
                icon="📋"
              />
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Правила использования
                  </label>
                  <textarea 
                    name="rules" 
                    placeholder="Например: Не курить, соблюдать тишину после 22:00..."
                    className={`w-full px-4 py-3 bg-[var(--bg-surface)] border rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 mobile-form ${
                      fieldErrors.rules ? "border-[var(--accent-error)]" : "border-[var(--border-primary)]"
                    }`}
                    rows={3}
                    required
                  />
                  {fieldErrors.rules && (
                    <p className="mt-2 text-sm text-[var(--accent-error)]">{fieldErrors.rules}</p>
                  )}
                </div>
              </CardContent>
            </MotionCard>

            {/* Кнопка отправки */}
            <MotionCard className="mobile-card">
              <CardContent>
                <Button
                  type="submit"
                  loading={loading}
                  size="lg"
                  className="w-full mobile-btn"
                  icon="🚀"
                >
                  {loading ? "Создание..." : "Отправить на модерацию"}
                </Button>
                <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                  После создания место будет проверено модераторами в течение 24 часов
                </p>
              </CardContent>
            </MotionCard>
          </form>
        </div>
      </div>
    </div>
  );
}


