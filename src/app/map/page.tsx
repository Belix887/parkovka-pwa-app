"use client";
import dynamic from "next/dynamic";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { getCurrentUser } from "@/lib/auth";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
      {/* Мобильная навигация */}
      <MobileNavigation />
      
      {/* Основной контент с отступом для мобильной шапки */}
      <div className="pt-16 md:pt-0">
        <main className="py-6 md:py-8">
          <div className="container">
            <MotionCard className="mobile-card">
              <CardHeader
                title="Карта парковок"
                subtitle="Интерактивная карта с доступными парковочными местами в Москве"
                icon="🗺️"
              />
              <CardContent>
                <div className="rounded-xl overflow-hidden h-[400px] md:h-[600px]">
                  <LeafletMap loadSpots={true} />
                </div>
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center p-3 md:p-4 bg-[var(--accent-primary)]/10 rounded-lg">
                    <div className="text-xl md:text-2xl mb-2">📍</div>
                    <div className="text-xs md:text-sm font-medium text-[var(--accent-primary)]">6 парковок</div>
                    <div className="text-xs text-[var(--text-secondary)]">в центре Москвы</div>
                  </div>
                  <div className="text-center p-3 md:p-4 bg-[var(--accent-success)]/10 rounded-lg">
                    <div className="text-xl md:text-2xl mb-2">💰</div>
                    <div className="text-xs md:text-sm font-medium text-[var(--accent-success)]">от 70₽/час</div>
                    <div className="text-xs text-[var(--text-secondary)]">доступные цены</div>
                  </div>
                  <div className="text-center p-3 md:p-4 bg-[var(--accent-warning)]/10 rounded-lg">
                    <div className="text-xl md:text-2xl mb-2">🛡️</div>
                    <div className="text-xs md:text-sm font-medium text-[var(--accent-warning)]">Охрана</div>
                    <div className="text-xs text-[var(--text-secondary)]">безопасность</div>
                  </div>
                  <div className="text-center p-3 md:p-4 bg-[var(--accent-error)]/10 rounded-lg">
                    <div className="text-xl md:text-2xl mb-2">⚡</div>
                    <div className="text-xs md:text-sm font-medium text-[var(--accent-error)]">Зарядка ЭВ</div>
                    <div className="text-xs text-[var(--text-secondary)]">электромобили</div>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </div>
        </main>
      </div>
    </div>
  );
}




