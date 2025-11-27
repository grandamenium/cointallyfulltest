'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAccountModalProps) {
  const [countdown, setCountdown] = useState(10);
  const [confirmText, setConfirmText] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (!open) {
      setCountdown(10);
      setConfirmText('');
      setIsEnabled(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const canDelete = isEnabled && confirmText === 'DELETE';

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="relative h-48 w-48">
            <Image
              src="/mascot/mascot-arrested-by-irs.png"
              alt="Warning mascot"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-4">
          {!isEnabled && (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Please wait{' '}
                <span className="font-bold text-destructive">{countdown}</span>{' '}
                seconds before proceeding
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmText">
              Type <span className="font-bold text-destructive">DELETE</span> to confirm
            </Label>
            <Input
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={!isEnabled}
              className={!isEnabled ? 'opacity-50' : ''}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canDelete}
            className={!canDelete ? 'opacity-50' : ''}
          >
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
