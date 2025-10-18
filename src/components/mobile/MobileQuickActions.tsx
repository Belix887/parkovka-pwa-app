"use client";
import Link from "next/link";

export function MobileQuickActions() {
  const actions = [
    {
      href: "/mobile/catalog",
      icon: "🔍",
      title: "Найти место",
      subtitle: "Поиск парковки",
      color: "blue"
    },
    {
      href: "/mobile/spots/create",
      icon: "➕",
      title: "Сдать место",
      subtitle: "Заработать деньги",
      color: "green"
    },
    {
      href: "/mobile/map",
      icon: "🗺️",
      title: "Карта",
      subtitle: "Интерактивная карта",
      color: "purple"
    },
    {
      href: "/mobile/profile",
      icon: "👤",
      title: "Профиль",
      subtitle: "Личный кабинет",
      color: "orange"
    }
  ];

  return (
    <div className="quick-actions-grid">
      {actions.map((action, index) => (
        <Link
          key={action.href}
          href={action.href}
          className={`quick-action-card ${action.color}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="action-icon">
            <span className="icon-emoji">{action.icon}</span>
            <div className="icon-glow"></div>
          </div>
          <div className="action-content">
            <h3 className="action-title">{action.title}</h3>
            <p className="action-subtitle">{action.subtitle}</p>
          </div>
          <div className="action-arrow">
            <span>→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
