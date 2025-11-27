'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface CategoryQuickPickerProps {
  currentCategory?: string;
  onSelect: (category: string) => Promise<void>;
  onError?: (error: Error) => void;
}

const COMMON_CATEGORIES: Category[] = [
  { id: 'personal', name: 'Personal', icon: 'U', color: 'bg-gray-100 text-gray-800' },
  { id: 'business-expense', name: 'Business Expense', icon: 'B', color: 'bg-blue-100 text-blue-800' },
  { id: 'income', name: 'Income', icon: '$', color: 'bg-green-100 text-green-800' },
];

const ALL_CATEGORIES: Category[] = [
  ...COMMON_CATEGORIES,
  { id: 'self-transfer', name: 'Self Transfer', icon: 'T', color: 'bg-purple-100 text-purple-800' },
  { id: 'gift', name: 'Gift', icon: 'G', color: 'bg-pink-100 text-pink-800' },
  { id: 'donation', name: 'Donation', icon: 'D', color: 'bg-red-100 text-red-800' },
  { id: 'mining', name: 'Mining', icon: 'M', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'staking', name: 'Staking', icon: 'S', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'airdrop', name: 'Airdrop', icon: 'A', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'lost', name: 'Lost', icon: 'X', color: 'bg-red-100 text-red-800' },
];

export function CategoryQuickPicker({ currentCategory, onSelect, onError }: CategoryQuickPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentCategories, setRecentCategories] = useState<string[]>([]);
  const [optimisticCategory, setOptimisticCategory] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentCategories');
      if (saved) {
        setRecentCategories(JSON.parse(saved).slice(0, 3));
      }
    }
  }, []);

  const filteredCategories = ALL_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayCategories = showAll ? filteredCategories : COMMON_CATEGORIES;

  const handleSelect = async (categoryId: string) => {
    setOptimisticCategory(categoryId);
    setIsLoading(true);

    try {
      await onSelect(categoryId);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 500);

      const updated = [categoryId, ...recentCategories.filter(c => c !== categoryId)].slice(0, 3);
      setRecentCategories(updated);

      if (typeof window !== 'undefined') {
        localStorage.setItem('recentCategories', JSON.stringify(updated));
      }

      setTimeout(() => {
        setIsOpen(false);
        setOptimisticCategory(null);
        setShowAll(false);
        setSearchTerm('');
      }, 600);

    } catch (error) {
      setOptimisticCategory(null);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayedCategory = optimisticCategory || currentCategory || 'uncategorized';
  const currentCategoryData = ALL_CATEGORIES.find(c => c.id === displayedCategory);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          disabled={isLoading}
        >
          {showSuccess ? (
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Saved!</span>
            </span>
          ) : (
            <>
              <span className="font-bold">{currentCategoryData?.icon || 'E'}</span>
              <span className="ml-1">{currentCategoryData?.name || 'Edit'}</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2 space-y-2">
          {showAll && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {!showAll && recentCategories.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-medium px-1 py-0">
                Recently Used
              </DropdownMenuLabel>
              <div className="space-y-0.5">
                {recentCategories.map(catId => {
                  const cat = ALL_CATEGORIES.find(c => c.id === catId);
                  if (!cat) return null;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelect(cat.id)}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent transition-colors flex items-center gap-2 text-sm"
                    >
                      <span className="font-bold w-5 text-center">{cat.icon}</span>
                      <span className="flex-1">{cat.name}</span>
                      {displayedCategory === cat.id && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          <div>
            {!showAll && (
              <DropdownMenuLabel className="text-xs text-muted-foreground font-medium px-1 py-0">
                Common
              </DropdownMenuLabel>
            )}
            <div className="space-y-0.5">
              {displayCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent transition-colors flex items-center gap-2 text-sm"
                >
                  <span className="font-bold w-5 text-center">{cat.icon}</span>
                  <span className="flex-1">{cat.name}</span>
                  {displayedCategory === cat.id && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {!searchTerm && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-xs"
              >
                {showAll ? 'Show Less' : `Show All (${ALL_CATEGORIES.length})`}
              </Button>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
