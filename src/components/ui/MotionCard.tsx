"use client";
import { motion } from "framer-motion";
import { PropsWithChildren, ReactNode } from "react";

interface MotionCardProps extends PropsWithChildren {
  className?: string;
  hover?: boolean;
  glass?: boolean;
  gradient?: boolean;
  style?: React.CSSProperties;
}

export function MotionCard({ 
  children, 
  className = "", 
  hover = true,
  glass = false,
  gradient = false,
  style = {}
}: MotionCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        duration: 0.6
      }}
      whileHover={hover ? {
        y: -4,
        transition: { duration: 0.2 }
      } : {}}
      className={`
        rounded-2xl p-8 shadow-lg border
        ${glass ? 'glass' : 'bg-[var(--bg-surface)] border-[var(--border-primary)]'}
        ${gradient ? 'gradient-primary' : ''}
        ${hover ? 'hover:shadow-xl hover:border-[var(--accent-primary)] transition-all duration-300' : ''}
        ${className}
      `}
      style={{
        background: gradient ? 'var(--gradient-primary)' : glass ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-surface)',
        backdropFilter: glass ? 'blur(10px)' : 'none',
        border: glass ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-lg)',
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, icon, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-start gap-4 mb-6 ${className}`}>
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--accent-primary)] bg-opacity-20 flex items-center justify-center text-[var(--accent-primary)] text-xl">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[var(--text-secondary)] text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

interface CardContentProps extends PropsWithChildren {
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div className={`text-[var(--text-secondary)] ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps extends PropsWithChildren {
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-6 border-t border-[var(--border-primary)] ${className}`}>
      {children}
    </div>
  );
}
