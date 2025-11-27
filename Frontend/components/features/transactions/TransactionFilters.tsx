'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';
import type { ConnectedSource } from '@/types/wallet';

interface FilterState {
  sourceId?: string;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  sources: ConnectedSource[];
}

export function TransactionFilters({ onFilterChange, sources }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
      {/* Source Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Source</label>
        <Select
          value={filters.sourceId || 'all'}
          onValueChange={(value) => handleFilterChange('sourceId', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.sourceName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
            <SelectItem value="transfer-in">Transfer In</SelectItem>
            <SelectItem value="transfer-out">Transfer Out</SelectItem>
            <SelectItem value="self-transfer">Self Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="business-expense">Business Expense</SelectItem>
            <SelectItem value="self-transfer">Self Transfer</SelectItem>
            <SelectItem value="gift">Gift</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date From */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">From Date</label>
        <Input
          type="date"
          className="w-[200px]"
          value={filters.dateFrom || ''}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        />
      </div>

      {/* Date To */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">To Date</label>
        <Input
          type="date"
          className="w-[200px]"
          value={filters.dateTo || ''}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        />
      </div>

      {/* Reset Button */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">&nbsp;</label>
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>

      {/* Export Button */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">&nbsp;</label>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
