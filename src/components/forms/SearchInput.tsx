import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme';
import {
  getCombinedSearchSuggestions,
  getRecentSearches,
  getPopularSearches,
  saveSearchHistory,
  clearSearchHistory,
} from '../../services/SearchService';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showHistory?: boolean;
  showPopular?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Search products...',
  showSuggestions = true,
  showHistory = true,
  showPopular = true,
  className = '',
  autoFocus = false,
}: SearchInputProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([]);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && showSuggestions) {
      if (value.trim()) {
        const combined = getCombinedSearchSuggestions(user.id, value, 8);
        setSuggestions(combined);
      } else {
        setSuggestions([]);
      }

      if (showHistory) {
        const recent = getRecentSearches(user.id, 5);
        setRecentSearches(recent.map(item => item.query));
      }

      if (showPopular) {
        const popular = getPopularSearches(user.id, 5);
        setPopularSearches(popular);
      }
    }
  }, [value, user, showSuggestions, showHistory, showPopular]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestionsPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestionsPanel(true);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestionsPanel(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestionsPanel) return;

    const allItems = [...suggestions, ...(showHistory ? recentSearches : []), ...(showPopular ? popularSearches.map(p => p.query) : [])];
    const uniqueItems = Array.from(new Set(allItems));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < uniqueItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < uniqueItems.length) {
        handleSuggestionClick(uniqueItems[focusedIndex]);
      } else if (value.trim()) {
        handleSearch(value);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestionsPanel(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    handleSearch(suggestion);
    setShowSuggestionsPanel(false);
    inputRef.current?.blur();
  };

  const handleSearch = (query: string) => {
    if (user && query.trim()) {
      saveSearchHistory(user.id, query);
    }
    if (onSearch) {
      onSearch(query);
    }
    setShowSuggestionsPanel(false);
  };

  const handleClearHistory = () => {
    if (user && window.confirm('Clear all search history?')) {
      clearSearchHistory(user.id);
      setRecentSearches([]);
    }
  };

  const displayItems = [
    ...(value.trim() && suggestions.length > 0 ? suggestions : []),
    ...(!value.trim() && showHistory && recentSearches.length > 0 ? recentSearches : []),
    ...(!value.trim() && showPopular && popularSearches.length > 0 ? popularSearches.map(p => p.query) : []),
  ];
  const uniqueDisplayItems = Array.from(new Set(displayItems));

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} className={className}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          onBlur={() => {
            // Delay to allow click events on suggestions
            setTimeout(() => setShowSuggestionsPanel(false), 200);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="form-input"
          style={{
            paddingRight: '2.5rem',
          }}
        />
        <button
          type="button"
          onClick={() => value.trim() && handleSearch(value)}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Search"
        >
          🔍
        </button>
      </div>

      {showSuggestionsPanel && showSuggestions && (
        <div
          className="surface-card"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.5rem',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {value.trim() && suggestions.length > 0 && (
            <div style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.5rem' }}>
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    textAlign: 'left',
                    background: focusedIndex === index ? colors.surface : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <span>🔍</span>
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {!value.trim() && showHistory && recentSearches.length > 0 && (
            <div style={{ padding: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary }}>Recent Searches</div>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: colors.textSecondary,
                    textDecoration: 'underline',
                  }}
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(search)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>🕐</span>
                  <span>{search}</span>
                </button>
              ))}
            </div>
          )}

          {!value.trim() && showPopular && popularSearches.length > 0 && (
            <div style={{ padding: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.5rem' }}>
                Popular Searches
              </div>
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(search.query)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🔥</span>
                    <span>{search.query}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: colors.textSecondary }}>{search.count}</span>
                </button>
              ))}
            </div>
          )}

          {uniqueDisplayItems.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
              {value.trim() ? 'No suggestions found' : 'Start typing to search...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

