"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface User {
  name: string;
  email: string;
}

interface MobileNavigationProps {
  user: User | null;
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/mobile-app",
      icon: "🏠",
      label: "Главная",
      active: pathname === "/mobile-app"
    },
    {
      href: "/mobile-app/catalog",
      icon: "🚗",
      label: "Каталог",
      active: pathname === "/mobile-app/catalog"
    },
    {
      href: "/mobile-app/map",
      icon: "🗺️",
      label: "Карта",
      active: pathname === "/mobile-app/map"
    },
    {
      href: "/mobile-app/pwa-demo",
      icon: "🚀",
      label: "PWA",
      active: pathname === "/mobile-app/pwa-demo"
    },
    {
      href: user ? "/mobile-app/profile" : "/mobile-app/login",
      icon: user ? "👤" : "🔑",
      label: user ? "Профиль" : "Вход",
      active: pathname === "/mobile-app/profile" || pathname === "/mobile-app/login"
    }
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            <div className="nav-icon">
              <span className="icon-emoji">{item.icon}</span>
              {item.active && <div className="active-indicator"></div>}
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
      
      {/* Декоративные элементы */}
      <div className="nav-decoration">
        <div className="nav-glow"></div>
      </div>
    </nav>
  );
}
