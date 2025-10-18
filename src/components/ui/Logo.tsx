"use client";
import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ 
  href = "/", 
  size = "md", 
  showText = true, 
  className = "" 
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "w-8 h-8",
      icon: "text-sm",
      text: "text-lg"
    },
    md: {
      container: "w-10 h-10", 
      icon: "text-lg",
      text: "text-2xl"
    },
    lg: {
      container: "w-12 h-12",
      icon: "text-xl", 
      text: "text-3xl"
    }
  };

  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses[size].container} bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:rotate-3`}>
        <span className={`text-white font-bold ${sizeClasses[size].icon}`}>P</span>
        <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20 rounded-xl"></div>
      </div>
      {showText && (
        <div className="relative">
          <div className="absolute inset-0 bg-black/20 rounded-lg blur-sm"></div>
          <span className={`relative font-bold text-white drop-shadow-xl ${sizeClasses[size].text}`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.5)' }}>
            Парковка
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className="group transition-all duration-300 hover:scale-105"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
