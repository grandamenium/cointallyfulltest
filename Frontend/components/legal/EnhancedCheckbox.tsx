'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function EnhancedCheckbox({ id, label, checked, onCheckedChange }: EnhancedCheckboxProps) {
  const [showRipple, setShowRipple] = useState(false);

  const handleClick = () => {
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 500);
    onCheckedChange(!checked);
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50">
      <button
        type="button"
        id={id}
        onClick={handleClick}
        className={cn(
          "relative flex h-6 w-6 items-center justify-center rounded border-2 transition-all duration-200",
          "hover:scale-110",
          checked
            ? "border-primary bg-primary"
            : "border-muted-foreground/30 bg-background"
        )}
      >
        {/* Checkmark */}
        <Check
          className={cn(
            "h-4 w-4 text-primary-foreground transition-all duration-400",
            checked
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0"
          )}
          style={{
            strokeDasharray: 50,
            strokeDashoffset: checked ? 0 : 50,
            transition: 'stroke-dashoffset 400ms ease-in-out',
          }}
        />

        {/* Ripple Effect */}
        {showRipple && (
          <div className="absolute inset-0 -m-2 animate-ping rounded-full bg-primary/30" />
        )}
      </button>

      <label
        htmlFor={id}
        className={cn(
          "flex-1 cursor-pointer text-sm transition-colors duration-300",
          checked ? "text-foreground font-medium" : "text-muted-foreground"
        )}
        onClick={handleClick}
      >
        {label}
      </label>
    </div>
  );
}
