"use client";
import { MotionCard } from "./MotionCard";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className = "" }: StatCardProps) {
  return (
    <MotionCard className={`text-center ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--accent-primary)] bg-opacity-20 flex items-center justify-center text-[var(--accent-primary)] text-2xl">
        {icon}
      </div>
      <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
        {value}
      </h3>
      <p className="text-[var(--text-secondary)] mb-2">
        {title}
      </p>
      {trend && (
        <div className={`flex items-center justify-center gap-1 text-sm ${
          trend.isPositive ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'
        }`}>
          <span>{trend.isPositive ? '↗' : '↘'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </MotionCard>
  );
}
