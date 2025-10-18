"use client";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({ 
  children, 
  variant = "default", 
  size = "md", 
  className = "" 
}: BadgeProps) {
  const baseClasses = "inline-flex items-center font-medium rounded-full";
  
  const variantClasses = {
    default: "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)]",
    // Use solid backgrounds for reliable contrast across Tailwind v4 (no bg-opacity utilities)
    success: "bg-[var(--accent-success)] text-white",
    warning: "bg-[var(--accent-warning)] text-white",
    error: "bg-[var(--accent-error)] text-white",
    info: "bg-[var(--accent-primary)] text-white"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
