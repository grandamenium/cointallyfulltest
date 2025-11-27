export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REGISTER: '/auth/register',

  // User
  USER_PROFILE: '/user/profile',
  USER_TAX_INFO: '/user/tax-info',

  // Wallets
  WALLETS_CONNECTED: '/wallets/connected',
  WALLETS_CONNECT: '/wallets/connect',
  WALLETS_DISCONNECT: (id: string) => `/wallets/disconnect/${id}`,
  WALLETS_RESYNC: (id: string) => `/wallets/resync/${id}`,

  // Transactions
  TRANSACTIONS_LIST: '/transactions',
  TRANSACTIONS_BY_ID: (id: string) => `/transactions/${id}`,
  TRANSACTIONS_CATEGORIZE: (id: string) => `/transactions/${id}/categorize`,
  TRANSACTIONS_BULK_CATEGORIZE: '/transactions/bulk-categorize',

  // Forms
  FORMS_LIST: '/forms',
  FORMS_GENERATE: '/forms/generate',
  FORMS_BY_ID: (id: string) => `/forms/${id}`,
  FORMS_DOWNLOAD: (id: string, format: string) => `/forms/${id}/download?format=${format}`,
} as const;
