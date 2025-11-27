export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  onboardingCompleted: boolean;
  taxInfo: {
    filingYear: number;
    state: string;
    filingStatus: 'single' | 'married-joint' | 'married-separate' | 'head-of-household';
    incomeBand: 'under-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'over-500k';
    priorYearLosses: number; // USD
  };
}
