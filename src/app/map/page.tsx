"use client";
import dynamic from "next/dynamic";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

export default function MapPage() {
  return (
    <main className="min-h-screen py-8">
      <div className="container">
        <MotionCard>
          <CardHeader
            title="Карта парковок"
            subtitle="Интерактивная карта с доступными парковочными местами в Москве"
            icon="🗺️"
          />
          <CardContent>
            <div className="rounded-xl overflow-hidden h-[600px]">
              <LeafletMap loadSpots={true} />
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">📍</div>
                <div className="text-sm font-medium text-blue-800">6 парковок</div>
                <div className="text-xs text-blue-600">в центре Москвы</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-medium text-green-800">от 70₽/час</div>
                <div className="text-xs text-green-600">доступные цены</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-sm font-medium text-purple-800">Охрана</div>
                <div className="text-xs text-purple-600">безопасность</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-sm font-medium text-orange-800">Зарядка ЭВ</div>
                <div className="text-xs text-orange-600">электромобили</div>
              </div>
            </div>
          </CardContent>
        </MotionCard>
      </div>
    </main>
  );
}




