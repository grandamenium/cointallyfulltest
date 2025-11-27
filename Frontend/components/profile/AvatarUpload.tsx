'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload?: (file: File) => void;
}

export function AvatarUpload({ currentAvatar, onUpload }: AvatarUploadProps) {
  const [avatar, setAvatar] = useState<string | null>(currentAvatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return false;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP files are allowed');
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setAvatar(reader.result as string);
        setIsUploading(false);
        setUploadProgress(0);
        toast.success('Avatar updated successfully');
        onUpload?.(file);
      }, 1000);
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-border transition-all duration-300",
          isDragging && "scale-105 border-primary",
          "hover:scale-105"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Avatar Image */}
        {avatar ? (
          <Image
            src={avatar}
            alt="Profile avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100"
        )}>
          <div className="text-center text-white">
            <Upload className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm font-medium">Change photo</p>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="w-20">
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-xs text-white">{uploadProgress}%</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Click or drag to upload
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, or WebP (max 5MB)
        </p>
      </div>
    </div>
  );
}
