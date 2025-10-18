"use client";
import dynamic from "next/dynamic";
import Link from "next/link";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

export function MobileMapPreview() {
  return (
    <div className="mobile-map-preview">
      <div className="map-container">
        <LeafletMap loadSpots={true} />
      </div>
      
      <div className="map-overlay">
        <div className="map-info">
          <div className="info-item">
            <span className="info-icon">📍</span>
            <span className="info-text">6 парковок в центре</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💰</span>
            <span className="info-text">от 70₽/час</span>
          </div>
        </div>
        
        <Link href="/mobile/map" className="map-button">
          <span className="button-icon">🗺️</span>
          <span className="button-text">Открыть карту</span>
        </Link>
      </div>
    </div>
  );
}
