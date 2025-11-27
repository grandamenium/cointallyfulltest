'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useUpdateTaxInfo, useUpdateProfile } from '@/hooks/useUser';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatedStepper } from '@/components/onboarding/AnimatedStepper';
import { MascotImage } from '@/components/ui/MascotImage';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingData {
  taxYear: number;
  state: string;
  filingStatus: 'single' | 'married-joint' | 'married-separate' | 'head-of-household' | '';
  incomeBand: 'under-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'over-500k' | '';
  priorYearLosses: number;
}

const steps = [
  'Welcome',
  'Tax Year',
  'State',
  'Filing Status',
  'Income',
  'Prior Losses',
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
];

// Enhanced Select Component with Animations
interface EnhancedSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  error?: string;
  isValid?: boolean;
  onBlur?: () => void;
}

function EnhancedSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  isValid,
  onBlur,
}: EnhancedSelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-2">
      {/* Animated Label */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: isFocused ? -2 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Label className={cn('block text-sm font-medium', error && 'text-red-500')}>
          {label}
        </Label>
      </motion.div>

      {/* Select with Shake Animation on Error */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : error
            ? { x: [0, 10, -10, 5, -5, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <Select
          value={value}
          onValueChange={(val) => {
            onValueChange(val);
          }}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open && onBlur) {
              onBlur();
            }
          }}
        >
          <SelectTrigger
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'transition-all duration-300',
              isFocused && 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20',
              error && 'border-red-500 ring-red-500',
              isValid && 'border-green-500 ring-green-500'
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Success Checkmark */}
        {isValid && !error && (
          <motion.div
            initial={shouldReduceMotion ? { x: 0, opacity: 1 } : { x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
          </motion.div>
        )}

        {/* Animated Chevron Rotation (visual only, actual chevron is inside SelectTrigger) */}
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <ChevronDown className="w-4 h-4 opacity-50" />
        </motion.div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Enhanced Input Component with Animations
interface EnhancedInputProps {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  error?: string;
  isValid?: boolean;
  disabled?: boolean;
}

function EnhancedInput({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  error,
  isValid,
  disabled,
}: EnhancedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-2">
      {/* Animated Label */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: isFocused ? -2 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Label className={cn('block text-sm font-medium', error && 'text-red-500')}>
          {label}
        </Label>
      </motion.div>

      {/* Input with Shake Animation on Error */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : error
            ? { x: [0, 10, -10, 5, -5, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'transition-all duration-300',
            isFocused && 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20',
            error && 'border-red-500 ring-red-500',
            isValid && 'border-green-500 ring-green-500'
          )}
        />

        {/* Success Checkmark */}
        {isValid && !error && !disabled && (
          <motion.div
            initial={shouldReduceMotion ? { x: 0, opacity: 1 } : { x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
          </motion.div>
        )}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const updateTaxInfo = useUpdateTaxInfo();
  const updateProfile = useUpdateProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    taxYear: 2024,
    state: '',
    filingStatus: '',
    incomeBand: '',
    priorYearLosses: 0,
  });
  const [noPriorLosses, setNoPriorLosses] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Validation state for form fields
  const [validationState, setValidationState] = useState({
    state: { touched: false, error: '', isValid: false },
    priorYearLosses: { touched: false, error: '', isValid: false },
  });

  // Validation functions
  const validateState = () => {
    if (!data.state) {
      setValidationState((prev) => ({
        ...prev,
        state: { touched: true, error: 'Please select a state', isValid: false },
      }));
      return false;
    }
    setValidationState((prev) => ({
      ...prev,
      state: { touched: true, error: '', isValid: true },
    }));
    return true;
  };

  const validatePriorYearLosses = () => {
    if (noPriorLosses) {
      setValidationState((prev) => ({
        ...prev,
        priorYearLosses: { touched: true, error: '', isValid: true },
      }));
      return true;
    }

    const value = data.priorYearLosses;
    if (value < 0) {
      setValidationState((prev) => ({
        ...prev,
        priorYearLosses: {
          touched: true,
          error: 'Prior losses cannot be negative',
          isValid: false,
        },
      }));
      return false;
    }

    // Valid if positive or zero
    setValidationState((prev) => ({
      ...prev,
      priorYearLosses: {
        touched: true,
        error: '',
        isValid: value >= 0,
      },
    }));
    return true;
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // TODO: BACKEND - Save progress after each step
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await updateTaxInfo.mutateAsync({
        filingYear: data.taxYear,
        state: data.state,
        filingStatus: data.filingStatus as any,
        incomeBand: data.incomeBand as any,
        priorYearLosses: data.priorYearLosses,
      });

      await updateProfile.mutateAsync({
        onboardingCompleted: true,
      });

      setShowCompletionModal(true);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      toast.error('Failed to save your information. Please try again.');
    }
  };

  // Trigger confetti when completion modal shows
  useEffect(() => {
    if (showCompletionModal && !shouldReduceMotion) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [showCompletionModal, shouldReduceMotion]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const canContinue = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome step
      case 1:
        return data.taxYear > 0;
      case 2:
        return data.state !== '';
      case 3:
        return data.filingStatus !== '';
      case 4:
        return data.incomeBand !== '';
      case 5:
        return true; // Prior losses is optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-3xl">
        {/* Animated Stepper */}
        <div className="mb-8">
          <AnimatedStepper currentStep={currentStep + 1} steps={steps} />
        </div>

        {/* Content Card */}
        <Card className="shadow-lg">
          <CardContent className={`min-h-[400px] p-8 ${currentStep === 0 ? 'bg-gradient-to-b from-white via-blue-50/30 to-blue-100/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700' : ''}`}>
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="flex flex-col items-center justify-center space-y-6 text-center py-8">
                {/* Mascot Image with Float Animation */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.6,
                    ease: 'easeOut',
                  }}
                >
                  <motion.div
                    animate={shouldReduceMotion ? {} : {
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <MascotImage
                      mascot="mascot-with-large-bitcoin.png"
                      alt="Welcome mascot"
                      size={200}
                      priority={true}
                      className="mx-auto"
                    />
                  </motion.div>
                </motion.div>

                <div className="space-y-4">
                  {/* Animated Title - Character by Character */}
                  <h2 className="text-3xl md:text-4xl font-heading font-bold">
                    {(() => {
                      const title = "Welcome to CoinTally!";
                      const characters = title.split('');

                      return characters.map((char, index) => (
                        <motion.span
                          key={index}
                          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            delay: shouldReduceMotion ? 0 : index * 0.05,
                            duration: shouldReduceMotion ? 0 : 0.3,
                          }}
                          style={{ display: 'inline-block' }}
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                      ));
                    })()}
                  </h2>

                  {/* Animated Subtitle - Fade Up */}
                  <motion.p
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : 0.4,
                      duration: shouldReduceMotion ? 0 : 0.4,
                      ease: 'easeOut',
                    }}
                    className="text-muted-foreground max-w-md mx-auto"
                  >
                    Let&apos;s get your tax information set up. This should only take a few minutes.
                  </motion.p>
                </div>
              </div>
            )}

            {/* Step 1: Tax Year */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-2xl font-heading font-semibold">
                    Which tax year are you filing for?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select the year you need to file taxes
                  </p>
                </div>
                <RadioGroup
                  value={data.taxYear.toString()}
                  onValueChange={(value) => setData({ ...data, taxYear: parseInt(value) })}
                  className="space-y-3"
                >
                  {[2025, 2024, 2023].map((year) => (
                    <Card
                      key={year}
                      className={`cursor-pointer hover:border-primary ${
                        data.taxYear === year ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="flex items-center p-4">
                        <RadioGroupItem value={year.toString()} id={`year-${year}`} />
                        <Label htmlFor={`year-${year}`} className="ml-3 flex-1 cursor-pointer">
                          <div className="font-medium">{year}</div>
                          {year === 2024 && (
                            <div className="text-xs text-muted-foreground">Recommended</div>
                          )}
                        </Label>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 2: State */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-2xl font-heading font-semibold">
                    Which state do you file taxes in?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select your state of residence for tax purposes
                  </p>
                </div>
                <EnhancedSelect
                  label="State"
                  value={data.state}
                  onValueChange={(value) => {
                    setData({ ...data, state: value });
                    // Clear error when user selects a value
                    if (value) {
                      setValidationState((prev) => ({
                        ...prev,
                        state: { touched: true, error: '', isValid: true },
                      }));
                    }
                  }}
                  options={US_STATES.map((state) => ({ value: state, label: state }))}
                  placeholder="Select a state"
                  error={validationState.state.touched ? validationState.state.error : undefined}
                  isValid={validationState.state.isValid}
                  onBlur={validateState}
                />
              </div>
            )}

            {/* Step 3: Filing Status */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-2xl font-heading font-semibold">
                    What is your filing status?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select your IRS filing status
                  </p>
                </div>
                <RadioGroup
                  value={data.filingStatus}
                  onValueChange={(value: string) => setData({ ...data, filingStatus: value as OnboardingData['filingStatus'] })}
                  className="space-y-3"
                >
                  {[
                    { value: 'single', label: 'Single', desc: 'Unmarried or legally separated' },
                    { value: 'married-joint', label: 'Married Filing Jointly', desc: 'Combined income with spouse' },
                    { value: 'married-separate', label: 'Married Filing Separately', desc: 'Separate from spouse' },
                    { value: 'head-of-household', label: 'Head of Household', desc: 'Unmarried with dependents' },
                  ].map((status) => (
                    <Card
                      key={status.value}
                      className={`cursor-pointer hover:border-primary ${
                        data.filingStatus === status.value ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="flex items-center p-4">
                        <RadioGroupItem value={status.value} id={status.value} />
                        <Label htmlFor={status.value} className="ml-3 flex-1 cursor-pointer">
                          <div className="font-medium">{status.label}</div>
                          <div className="text-xs text-muted-foreground">{status.desc}</div>
                        </Label>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 4: Income Band */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-2xl font-heading font-semibold">
                    What is your estimated annual income?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This helps us provide accurate tax calculations
                  </p>
                </div>
                <RadioGroup
                  value={data.incomeBand}
                  onValueChange={(value: string) => setData({ ...data, incomeBand: value as OnboardingData['incomeBand'] })}
                  className="space-y-3"
                >
                  {[
                    { value: 'under-50k', label: 'Under $50,000' },
                    { value: '50k-100k', label: '$50,000 - $100,000' },
                    { value: '100k-200k', label: '$100,000 - $200,000' },
                    { value: '200k-500k', label: '$200,000 - $500,000' },
                    { value: 'over-500k', label: 'Over $500,000' },
                  ].map((band) => (
                    <Card
                      key={band.value}
                      className={`cursor-pointer hover:border-primary ${
                        data.incomeBand === band.value ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="flex items-center p-4">
                        <RadioGroupItem value={band.value} id={band.value} />
                        <Label htmlFor={band.value} className="ml-3 flex-1 cursor-pointer">
                          <div className="font-medium">{band.label}</div>
                        </Label>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 5: Prior Year Losses */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-2xl font-heading font-semibold">
                    Do you have capital losses from prior years?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Capital losses can be carried forward to offset future gains
                  </p>
                </div>
                <div className="space-y-4">
                  <EnhancedInput
                    label="Prior Year Losses (USD)"
                    type="number"
                    placeholder="0.00"
                    value={noPriorLosses ? 0 : data.priorYearLosses}
                    onChange={(value) => {
                      const numValue = parseFloat(value) || 0;
                      setData({ ...data, priorYearLosses: numValue });
                      // Auto-validate as user types
                      if (numValue >= 0) {
                        setValidationState((prev) => ({
                          ...prev,
                          priorYearLosses: { touched: true, error: '', isValid: true },
                        }));
                      }
                    }}
                    disabled={noPriorLosses}
                    error={
                      validationState.priorYearLosses.touched
                        ? validationState.priorYearLosses.error
                        : undefined
                    }
                    isValid={validationState.priorYearLosses.isValid && !noPriorLosses}
                    onBlur={validatePriorYearLosses}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-losses"
                      checked={noPriorLosses}
                      onCheckedChange={(checked) => {
                        setNoPriorLosses(checked as boolean);
                        if (checked) {
                          setData({ ...data, priorYearLosses: 0 });
                          setValidationState((prev) => ({
                            ...prev,
                            priorYearLosses: { touched: true, error: '', isValid: true },
                          }));
                        }
                      }}
                    />
                    <Label htmlFor="no-losses" className="cursor-pointer text-sm">
                      I don&apos;t have prior year losses
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {/* Special animated "Get Started" button for welcome screen */}
          {currentStep === 0 ? (
            <motion.div
              animate={shouldReduceMotion ? {} : {
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                whileHover={shouldReduceMotion ? {} : { y: -2 }}
                transition={{ duration: 0.3 }}
              >
                <Button onClick={handleNext} disabled={!canContinue()} size="lg">
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <Button onClick={handleNext} disabled={!canContinue()}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Continue'}
            </Button>
          )}
        </div>

        {/* Completion Celebration Modal */}
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowCompletionModal(false)}
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mascot with bounce animation */}
              <motion.div
                initial={shouldReduceMotion ? { scale: 1, y: 0 } : { scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1], // bounce
                }}
                className="mb-6 flex justify-center"
              >
                <MascotImage
                  mascot="mascot-standing.png"
                  alt="Completion celebration"
                  size={200}
                  priority={true}
                />
              </motion.div>

              <h2 className="text-3xl font-bold font-heading mb-4">All set!</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Let&apos;s calculate your taxes!
              </p>

              <Button
                onClick={handleGoToDashboard}
                size="lg"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
