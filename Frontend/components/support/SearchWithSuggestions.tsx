'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  category: string;
}

interface SearchWithSuggestionsProps {
  onSearch?: (query: string) => void;
}

const POPULAR_ARTICLES: Article[] = [
  { id: '1', title: 'How to connect your wallet', category: 'Getting Started' },
  { id: '2', title: 'Understanding tax methods (FIFO, LIFO, HIFO)', category: 'Tax Info' },
  { id: '3', title: 'Categorizing transactions correctly', category: 'Transactions' },
  { id: '4', title: 'Importing CSV files', category: 'Import' },
  { id: '5', title: 'Tax loss harvesting explained', category: 'Tax Info' },
];

export function SearchWithSuggestions({ onSearch }: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = POPULAR_ARTICLES.filter((article) =>
        article.title.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      const allSuggestions = [
        ...recentSearches.map((s) => ({ type: 'recent', value: s })),
        ...suggestions.map((s) => ({ type: 'article', value: s.title })),
      ];

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allSuggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelect(allSuggestions[selectedIndex].value);
          } else if (query) {
            handleSearch();
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSuggestions, selectedIndex, suggestions, recentSearches, query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;

    // Add to recent searches
    const newRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    onSearch?.(query);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSelect = (value: string) => {
    setQuery(value);
    handleSearch();
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const removeRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter((s) => s !== search);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-foreground">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const allSuggestions = [
    ...recentSearches.map((s) => ({ type: 'recent', value: s })),
    ...suggestions.map((s) => ({ type: 'article', value: s.title, article: s })),
  ];

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search for help..."
          className="pl-10 pr-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && (recentSearches.length > 0 || suggestions.length > 0 || !query) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-2 w-full rounded-lg border bg-popover p-2 shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="mb-2">
              <div className="mb-1 flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleSelect(search)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                    selectedIndex === index
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  )}
                >
                  <span>{search}</span>
                  <X
                    className="h-3 w-3 text-muted-foreground hover:text-foreground"
                    onClick={(e) => removeRecentSearch(search, e)}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Popular Articles */}
          {!query && (
            <div>
              <div className="mb-1 flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Popular Articles
              </div>
              {POPULAR_ARTICLES.map((article, index) => {
                const adjustedIndex = index + recentSearches.length;
                return (
                  <button
                    key={article.id}
                    onClick={() => handleSelect(article.title)}
                    className={cn(
                      'flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm transition-colors',
                      selectedIndex === adjustedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <span className="font-medium">{article.title}</span>
                    <span className="text-xs text-muted-foreground">{article.category}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search Suggestions */}
          {query && suggestions.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                <Search className="h-3 w-3" />
                Suggestions
              </div>
              {suggestions.map((article, index) => {
                const adjustedIndex = index + recentSearches.length;
                return (
                  <button
                    key={article.id}
                    onClick={() => handleSelect(article.title)}
                    className={cn(
                      'flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm transition-colors',
                      selectedIndex === adjustedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <span className="font-medium">{highlightMatch(article.title, query)}</span>
                    <span className="text-xs text-muted-foreground">{article.category}</span>
                  </button>
                );
              })}
            </div>
          )}

          {query && suggestions.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No articles found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
