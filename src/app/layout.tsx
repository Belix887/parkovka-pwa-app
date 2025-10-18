import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Logo } from "@/components/ui/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Парковка - Аренда частных парковочных мест",
  description: "Сервис по аренде частных парковочных мест",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <html lang="ру">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <nav className="sticky top-0 z-50 bg-[var(--bg-secondary)] backdrop-blur-md border-b border-[var(--border-primary)] shadow-lg">
            <div className="container">
              <div className="flex justify-between items-center py-4">
                <Logo href="/" size="md" showText={true} />
                
                <div className="hidden md:flex items-center gap-8">
                  <Link 
                    href="/catalog" 
                    className="group text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 font-medium relative"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg group-hover:animate-bounce">🚗</span>
                      Каталог
                    </span>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--accent-primary)] group-hover:w-full transition-all duration-300"></div>
                  </Link>
                  <Link 
                    href="/map" 
                    className="group text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 font-medium relative"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg group-hover:animate-bounce">🗺️</span>
                      Карта
                    </span>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--accent-primary)] group-hover:w-full transition-all duration-300"></div>
                  </Link>
                  <Link 
                    href="/spots/create" 
                    className="group text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 font-medium relative"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg group-hover:animate-bounce">➕</span>
                      Создать место
                    </span>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--accent-primary)] group-hover:w-full transition-all duration-300"></div>
                  </Link>
                  <Link 
                    href="/requests" 
                    className="group text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 font-medium relative"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg group-hover:animate-bounce">📋</span>
                      Заявки
                    </span>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--accent-primary)] group-hover:w-full transition-all duration-300"></div>
                  </Link>
                  {!user && (
                    <Link 
                      href="/profile" 
                      className="group text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 font-medium relative"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg group-hover:animate-bounce">👤</span>
                        Профиль
                      </span>
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--accent-primary)] group-hover:w-full transition-all duration-300"></div>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {user ? (
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                      <span className="text-[var(--text-primary)] font-medium max-w-[160px] truncate">{user.name || user.email}</span>
                    </Link>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="group px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 font-medium rounded-xl hover:bg-[var(--bg-surface)]"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg group-hover:animate-bounce">🔑</span>
                          Вход
                        </span>
                      </Link>
                      <Link 
                        href="/register" 
                        className="group relative px-6 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-medium shadow-lg overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center gap-2">
                          <span className="text-lg group-hover:animate-bounce">✨</span>
                          Регистрация
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <main className="min-h-screen">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
