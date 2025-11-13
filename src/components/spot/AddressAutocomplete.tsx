"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { suggestAddresses, GeocodeSuggestion } from "@/lib/geocoding";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onSelect: (suggestion: GeocodeSuggestion) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Начните вводить адрес...",
  error,
  required = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setErrorMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    
    try {
      const results = await suggestAddresses(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      
      if (results.length === 0 && query.trim().length >= 2) {
        setErrorMessage("Адреса не найдены. Попробуйте ввести другой адрес или проверьте настройки API ключа.");
      }
    } catch (error) {
      console.error("Address suggestions error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
      setErrorMessage("Ошибка при поиске адресов. Проверьте подключение к интернету и настройки API.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Очищаем предыдущий таймер
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Если текст слишком короткий, сразу очищаем
    if (newValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setErrorMessage(null);
      return;
    }

    // Устанавливаем новый таймер для debounce (500ms)
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500);
  };

  const handleSelect = (suggestion: GeocodeSuggestion) => {
    onChange(suggestion.formattedAddress);
    onSelect(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={async () => {
          // При фокусе, если есть текст, загружаем предложения
          if (value.trim().length >= 2) {
            await fetchSuggestions(value);
          } else if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 bg-[var(--bg-surface)] border rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 mobile-form ${
          error ? "border-[var(--accent-error)]" : "border-[var(--border-primary)]"
        }`}
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl shadow-xl max-h-60 overflow-y-auto"
          style={{ 
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
            maxHeight: "240px",
            top: "100%"
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.lat}-${suggestion.lng}-${index}`}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-card)] transition-colors duration-200 border-b border-[var(--border-primary)] last:border-b-0 cursor-pointer"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">📍</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] break-words">
                    {suggestion.formattedAddress}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {suggestion.lat.toFixed(6)}, {suggestion.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {(error || errorMessage) && (
        <p className="mt-2 text-sm text-[var(--accent-error)]">{error || errorMessage}</p>
      )}
      
      {!loading && !error && !errorMessage && value.length >= 2 && suggestions.length === 0 && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Введите больше символов для поиска адресов
        </p>
      )}
    </div>
  );
}

