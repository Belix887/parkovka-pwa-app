"use client";

import { useState, useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue.length >= 2) {
      setLoading(true);
      try {
        const results = await suggestAddresses(newValue);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error("Address suggestions error:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
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
        onFocus={() => {
          if (suggestions.length > 0) {
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
          className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors duration-200 border-b border-[var(--border-primary)] last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">📍</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
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

      {error && (
        <p className="mt-2 text-sm text-[var(--accent-error)]">{error}</p>
      )}
    </div>
  );
}

