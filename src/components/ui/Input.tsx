"use client";
import { InputHTMLAttributes, forwardRef, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, iconPosition = "left", className = "", type, ...rest }, ref) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === "password";
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-[var(--bg-surface)] border rounded-xl
              text-[var(--text-primary)] placeholder-[var(--text-muted)]
              focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent
              transition-all duration-300
              ${icon && iconPosition === "left" ? "pl-12" : ""}
              ${icon && iconPosition === "right" ? (isPassword ? "pr-24" : "pr-12") : (isPassword ? "pr-12" : "")}
              ${error ? "border-[var(--accent-error)]" : "border-[var(--border-primary)]"}
              ${className}
            `}
            type={isPassword ? (passwordVisible ? "text" : "password") : type}
            {...rest}
          />
          {icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setPasswordVisible(v => !v)}
              className={`absolute ${icon && iconPosition === "right" ? "right-10" : "right-3"} top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors`}
              aria-label={passwordVisible ? "Скрыть пароль" : "Показать пароль"}
            >
              {passwordVisible ? "🙈" : "👁️"}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-[var(--accent-error)]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
