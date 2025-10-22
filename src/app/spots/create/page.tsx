"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { MotionCard, CardHeader, CardContent, CardFooter } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { useRouter } from "next/navigation";

export default function CreateSpotPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    const payload = {
      title: String(body.title),
      description: String(body.description),
      pricePerHour: Number(body.pricePerHour),
      sizeL: Number(body.sizeL),
      sizeW: Number(body.sizeW),
      sizeH: Number(body.sizeH),
      covered: Boolean(body.covered),
      guarded: Boolean(body.guarded),
      camera: Boolean(body.camera),
      evCharging: Boolean(body.evCharging),
      disabledAccessible: Boolean(body.disabledAccessible),
      wideEntrance: Boolean(body.wideEntrance),
      accessType: String(body.accessType),
      rules: String(body.rules),
      address: String(body.address),
      geoLat: Number(body.geoLat),
      geoLng: Number(body.geoLng),
      photos,
    };
    
    setLoading(true);
    try {
      const r = await fetch("/api/spots", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
      if (r.ok) {
        showSuccess("Место создано", "Ваше место отправлено на модерацию");
        (e.currentTarget as HTMLFormElement).reset();
        setPhotos([]);
        router.push("/profile");
      } else {
        const errorData = await r.json();
        showError("Ошибка создания", errorData.error || "Не удалось создать место");
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
      <div className="pt-16 md:pt-0">
        <div className="container py-6 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Создать парковочное место
            </h1>
            <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-2xl mx-auto">
              Добавьте свое парковочное место и начните зарабатывать на аренде
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 md:space-y-8">
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
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Описание
                    </label>
                    <textarea 
                      name="description" 
                      placeholder="Опишите особенности вашего парковочного места..."
                      className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 mobile-form"
                      rows={4}
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="pricePerHour"
                      label="Цена за час (копейки)"
                      type="number"
                      placeholder="10000"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Тип доступа
                      </label>
                      <select 
                        name="accessType" 
                        className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 mobile-form"
                      >
                        <option value="PRIVATE_GATE">Закрытая территория</option>
                        <option value="STREET">Улица</option>
                        <option value="GARAGE">Гараж</option>
                        <option value="YARD">Двор</option>
                        <option value="OTHER">Другое</option>
                      </select>
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
                    />
                    <Input
                      name="sizeW"
                      label="Ширина (м)"
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      required
                    />
                    <Input
                      name="sizeH"
                      label="Высота (м)"
                      type="number"
                      step="0.1"
                      placeholder="2.2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Адрес
                    </label>
                    <input 
                      name="address" 
                      placeholder="Укажите точный адрес"
                      className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 mobile-form"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="geoLat"
                      label="Широта"
                      type="number"
                      step="any"
                      placeholder="55.7558"
                    />
                    <Input
                      name="geoLng"
                      label="Долгота"
                      type="number"
                      step="any"
                      placeholder="37.6176"
                    />
                  </div>
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
                    <Button type="button" variant="outline" icon="📷" className="w-full mobile-btn">Добавить фото ({photos.length}/10)</Button>
                  </label>
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
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 mobile-form"
                    rows={3}
                  />
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


