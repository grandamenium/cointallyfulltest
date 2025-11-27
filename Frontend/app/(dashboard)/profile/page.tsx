'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { DeleteAccountModal } from '@/components/profile/DeleteAccountModal';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile, useUpdateTaxInfo } from '@/hooks/useUser';
import { toast } from 'sonner';
import { ChevronDown, Edit2, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SectionId = 'personal' | 'tax' | 'preferences' | 'danger';

export default function ProfilePage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const updateTaxInfo = useUpdateTaxInfo();
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(['personal', 'tax', 'preferences', 'danger'])
  );
  const [editMode, setEditMode] = useState<Set<SectionId>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Set<SectionId>>(new Set());
  const [isSaving, setIsSaving] = useState<Set<SectionId>>(new Set());
  const [savedSections, setSavedSections] = useState<Set<SectionId>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    filingYear: user?.taxInfo?.filingYear?.toString() || new Date().getFullYear().toString(),
    state: user?.taxInfo?.state || '',
    filingStatus: user?.taxInfo?.filingStatus || 'single',
    priorLosses: user?.taxInfo?.priorYearLosses || 0,
    taxMethod: 'FIFO',
  });

  // Auto-save with debounce
  useEffect(() => {
    const unsavedSectionsArray = Array.from(hasUnsavedChanges);
    if (unsavedSectionsArray.length === 0) return;

    const timer = setTimeout(() => {
      unsavedSectionsArray.forEach((section) => {
        handleAutoSave(section);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, hasUnsavedChanges]);

  const toggleSection = (section: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const toggleEditMode = (section: SectionId) => {
    setEditMode((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleFieldChange = (section: SectionId, field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges((prev) => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
    setSavedSections((prev) => {
      const next = new Set(prev);
      next.delete(section);
      return next;
    });
  };

  const handleAutoSave = async (section: SectionId) => {
    setIsSaving((prev) => new Set(prev).add(section));

    try {
      if (section === 'personal') {
        await updateProfile.mutateAsync({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        toast.success('Profile updated successfully');
      } else if (section === 'tax') {
        await updateTaxInfo.mutateAsync({
          filingYear: parseInt(formData.filingYear),
          state: formData.state,
          filingStatus: formData.filingStatus as any,
          incomeBand: user?.taxInfo?.incomeBand || 'under-50k',
          priorYearLosses: formData.priorLosses,
        });
        toast.success('Tax information updated successfully');
      }

      setSavedSections((prev) => new Set(prev).add(section));

      setTimeout(() => {
        setSavedSections((prev) => {
          const next = new Set(prev);
          next.delete(section);
          return next;
        });
      }, 2000);
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving((prev) => {
        const next = new Set(prev);
        next.delete(section);
        return next;
      });
      setHasUnsavedChanges((prev) => {
        const next = new Set(prev);
        next.delete(section);
        return next;
      });
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deleted');
    // Handle account deletion
  };

  const renderSectionHeader = (
    section: SectionId,
    title: string,
    isDanger: boolean = false
  ) => {
    const isExpanded = expandedSections.has(section);
    const isEditing = editMode.has(section);
    const hasChanges = hasUnsavedChanges.has(section);
    const saving = isSaving.has(section);
    const saved = savedSections.has(section);

    return (
      <CardHeader className="cursor-pointer select-none" onClick={() => toggleSection(section)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className={cn(isDanger && 'text-destructive')}>{title}</CardTitle>
            {hasChanges && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" title="Unsaved changes" />
            )}
            {saving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Saving...</span>
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-1 text-sm text-green-600 animate-in fade-in duration-300">
                <Check className="h-4 w-4" />
                <span>Saved!</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isDanger && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEditMode(section);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </div>
      </CardHeader>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account and tax information</p>
        </div>

        {/* Avatar Section */}
        <Card>
          <CardContent className="pt-6">
            <AvatarUpload />
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          {renderSectionHeader('personal', 'Personal Information')}
          {expandedSections.has('personal') && (
            <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('personal', 'firstName', e.target.value)}
                    disabled={!editMode.has('personal')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('personal', 'lastName', e.target.value)}
                    disabled={!editMode.has('personal')}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tax Information */}
        <Card>
          {renderSectionHeader('tax', 'Tax Information')}
          {expandedSections.has('tax') && (
            <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="filingYear">Filing Year</Label>
                  <Select
                    value={formData.filingYear}
                    onValueChange={(value) => handleFieldChange('tax', 'filingYear', value)}
                    disabled={!editMode.has('tax')}
                  >
                    <SelectTrigger id="filingYear">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleFieldChange('tax', 'state', e.target.value)}
                    disabled={!editMode.has('tax')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select
                    value={formData.filingStatus}
                    onValueChange={(value) => handleFieldChange('tax', 'filingStatus', value)}
                    disabled={!editMode.has('tax')}
                  >
                    <SelectTrigger id="filingStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married-joint">Married Filing Jointly</SelectItem>
                      <SelectItem value="married-separate">Married Filing Separately</SelectItem>
                      <SelectItem value="head-of-household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priorLosses">Prior Year Losses</Label>
                  <Input
                    id="priorLosses"
                    type="number"
                    value={formData.priorLosses}
                    onChange={(e) => handleFieldChange('tax', 'priorLosses', Number(e.target.value))}
                    disabled={!editMode.has('tax')}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Preferences */}
        <Card>
          {renderSectionHeader('preferences', 'Preferences')}
          {expandedSections.has('preferences') && (
            <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="taxMethod">Default Tax Method</Label>
                <Select
                  value={formData.taxMethod}
                  onValueChange={(value) => handleFieldChange('preferences', 'taxMethod', value)}
                  disabled={!editMode.has('preferences')}
                >
                  <SelectTrigger id="taxMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                    <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
                    <SelectItem value="HIFO">HIFO (Highest In, First Out)</SelectItem>
                    <SelectItem value="SpecificID">Specific ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive bg-destructive/5">
          {renderSectionHeader('danger', 'Danger Zone', true)}
          {expandedSections.has('danger') && (
            <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <h3 className="mb-2 font-medium flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete Account
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteModalOpen(true)}
                  className="transition-transform hover:scale-105 active:scale-95"
                  style={{
                    animation: 'shake 0.3s ease-in-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.animation = 'none';
                    setTimeout(() => {
                      e.currentTarget.style.animation = 'shake 0.3s ease-in-out';
                    }, 10);
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

      <DeleteAccountModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteAccount}
      />

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
