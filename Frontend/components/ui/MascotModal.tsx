'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { MascotImage } from './MascotImage';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';

interface MascotModalProps {
  isOpen: boolean;
  onClose: () => void;
  mascotImage: string;
  title: string;
  message: string;
  buttonText?: string;
  buttonAction?: () => void;
}

export function MascotModal({
  isOpen,
  onClose,
  mascotImage,
  title,
  message,
  buttonText = 'Got it',
  buttonAction,
}: MascotModalProps) {
  const handleButtonClick = () => {
    if (buttonAction) {
      buttonAction();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-4"
              >
                <MascotImage
                  mascot={mascotImage}
                  alt="CoinTally Mascot"
                  size={200}
                  className="mx-auto"
                />
              </motion.div>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {message}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="mt-6 flex justify-center">
            <Button onClick={handleButtonClick} size="lg" className="px-8">
              {buttonText}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
