'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BulkActionBarProps {
  selectedCount: number;
  onCategorize: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onCategorize,
  onExport,
  onDelete,
  onClearSelection,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg shadow-2xl px-6 py-4"
        >
          <div className="flex items-center gap-6">
            {/* Selection Count */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {selectedCount} selected
                </Badge>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-primary-foreground/20" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onCategorize}
                  className="gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Categorize
                </Button>
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-primary-foreground/20" />

            {/* Clear Selection */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="gap-1 hover:bg-primary-foreground/10"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
