'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SmartSearchProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: {
    assets?: string[];
    sources?: string[];
    categories?: string[];
  };
}

export function SmartSearch({ value, onChange, suggestions }: SmartSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentTransactionSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    }
  }, []);

  // Save search to recent when user types and presses Enter or selects
  const saveToRecent = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('recentTransactionSearches', JSON.stringify(updated));
    }
  };

  // Generate autocomplete suggestions based on input
  const autocompleteSuggestions = (() => {
    if (!value.trim()) return [];

    const allSuggestions: { text: string; type: 'asset' | 'source' | 'category' }[] = [];
    const term = value.toLowerCase();

    // Add matching assets
    suggestions?.assets?.forEach(asset => {
      if (asset.toLowerCase().includes(term)) {
        allSuggestions.push({ text: asset, type: 'asset' });
      }
    });

    // Add matching sources
    suggestions?.sources?.forEach(source => {
      if (source.toLowerCase().includes(term)) {
        allSuggestions.push({ text: source, type: 'source' });
      }
    });

    // Add matching categories
    suggestions?.categories?.forEach(category => {
      if (category.toLowerCase().includes(term)) {
        allSuggestions.push({ text: category, type: 'category' });
      }
    });

    return allSuggestions.slice(0, 5);
  })();

  // Show dropdown when focused and there are suggestions or recent searches
  useEffect(() => {
    setShowDropdown(
      isFocused && (autocompleteSuggestions.length > 0 || (recentSearches.length > 0 && !value))
    );
  }, [isFocused, autocompleteSuggestions.length, recentSearches.length, value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemsToShow = value ? autocompleteSuggestions : recentSearches.map(s => ({ text: s, type: 'recent' as const }));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < itemsToShow.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && itemsToShow[selectedIndex]) {
        const selected = itemsToShow[selectedIndex].text;
        onChange(selected);
        saveToRecent(selected);
        setShowDropdown(false);
        setSelectedIndex(-1);
      } else if (value) {
        saveToRecent(value);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (text: string) => {
    onChange(text);
    saveToRecent(text);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const clearRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== searchTerm);
    setRecentSearches(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('recentTransactionSearches', JSON.stringify(updated));
    }
  };

  const getBadgeVariant = (type: 'asset' | 'source' | 'category' | 'recent') => {
    switch (type) {
      case 'asset': return 'default';
      case 'source': return 'secondary';
      case 'category': return 'outline';
      default: return 'outline';
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <span className="font-semibold bg-yellow-100 dark:bg-yellow-900/30">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <motion.div
          animate={{ scale: isFocused ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
            isFocused ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search by asset, source, or category..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Delay to allow clicking on suggestions
              setTimeout(() => setIsFocused(false), 200);
            }}
            onKeyDown={handleKeyDown}
            className={`pl-10 transition-all duration-200 ${
              isFocused ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full rounded-lg border bg-popover shadow-lg"
          >
            {value ? (
              // Autocomplete suggestions
              <div className="p-2">
                <div className="text-xs text-muted-foreground px-2 py-1 font-medium">Suggestions</div>
                {autocompleteSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.text}`}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between gap-2 ${
                      index === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <span className="flex-1 text-sm">
                      {highlightMatch(suggestion.text, value)}
                    </span>
                    <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : recentSearches.length > 0 ? (
              // Recent searches
              <div className="p-2">
                <div className="text-xs text-muted-foreground px-2 py-1 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleSuggestionClick(search)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between gap-2 group ${
                      index === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <span className="flex-1 text-sm">{search}</span>
                    <button
                      onClick={(e) => clearRecentSearch(search, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
