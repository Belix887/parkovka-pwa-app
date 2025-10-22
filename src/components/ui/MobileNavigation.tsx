"use client";
import { useState } from "react";
import { Button } from "./Button";
import { Logo } from "./Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MobileNavigationProps {
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  } | null;
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Мобильная шапка */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] md:hidden">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/profile">
                <Button variant="ghost" size="sm" icon="👤">
                  Профиль
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Войти
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              icon={isMenuOpen ? "✕" : "☰"}
              onClick={toggleMenu}
              className="mobile-btn"
            >
              {isMenuOpen ? "✕" : "☰"}
            </Button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="absolute top-16 left-0 right-0 bg-[var(--bg-surface)] border-b border-[var(--border-primary)] shadow-xl">
            <nav className="container py-4">
              <div className="space-y-2">
                <Link 
                  href="/" 
                  className="block w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏠 Главная
                </Link>
                
                <Link 
                  href="/map" 
                  className="block w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🗺️ Карта
                </Link>
                
                <Link 
                  href="/catalog" 
                  className="block w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📋 Каталог
                </Link>

                {user && (
                  <>
                    <div className="border-t border-[var(--border-primary)] my-2" />
                    
                    <Link 
                      href="/profile" 
                      className="block w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      👤 Мой профиль
                    </Link>
                    
                    <Link 
                      href="/spots/create" 
                      className="block w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ➕ Добавить место
                    </Link>
                    
                    {user.role === "OWNER" && (
                      <Link 
                        href="/owner/requests" 
                        className="block w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        📋 Заявки
                      </Link>
                    )}
                    
                    <div className="border-t border-[var(--border-primary)] my-2" />
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--accent-error)]"
                    >
                      🚪 Выйти
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
