import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// Seed for consistent data across team
const SEED = process.env.MOCK_SEED ? parseInt(process.env.MOCK_SEED) : 12345;
faker.seed(SEED);

const MOCK_USER_ID = 'mock-user-id';

// Generate mock user
const mockUser = {
  id: MOCK_USER_ID,
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date('2024-01-01'),
  onboardingCompleted: true,
  taxInfo: {
    filingYear: 2024,
    state: 'California',
    filingStatus: 'single',
    incomeBand: '100k-200k',
    priorYearLosses: 5000,
  },
};

// Available connection sources
const connectionSources = [
  // Blockchains
  {
    id: 'ethereum',
    name: 'Ethereum',
    type: 'blockchain',
    logo: '/logos/ethereum.png',
    connectionMethods: ['wallet-connect', 'api-key'],
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    type: 'blockchain',
    logo: '/logos/bitcoin.png',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'solana',
    name: 'Solana',
    type: 'blockchain',
    logo: '/logos/solana.png',
    connectionMethods: ['wallet-connect', 'api-key'],
  },
  {
    id: 'polygon',
    name: 'Polygon',
    type: 'blockchain',
    logo: '/logos/polygon.png',
    connectionMethods: ['wallet-connect', 'api-key'],
  },
  // Exchanges
  {
    id: 'coinbase',
    name: 'Coinbase',
    type: 'exchange',
    logo: '/logos/coinbase.png',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'binance',
    name: 'Binance',
    type: 'exchange',
    logo: '/logos/binance.png',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'kraken',
    name: 'Kraken',
    type: 'exchange',
    logo: '/logos/kraken.png',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'bybit',
    name: 'Bybit',
    type: 'exchange',
    logo: '/logos/bybit.png',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'okx',
    name: 'OKX',
    type: 'exchange',
    logo: '/logos/okx.png',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'kucoin',
    name: 'KuCoin',
    type: 'exchange',
    logo: '/logos/kucoin.png',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'gateio',
    name: 'Gate.io',
    type: 'exchange',
    logo: '/logos/gateio.png',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  // Wallets
  {
    id: 'metamask',
    name: 'MetaMask',
    type: 'wallet',
    logo: '/logos/metamask.png',
    connectionMethods: ['wallet-connect'],
  },
  {
    id: 'ledger',
    name: 'Ledger',
    type: 'wallet',
    logo: '/logos/ledger.png',
    connectionMethods: ['wallet-connect', 'api-key'],
  },
  {
    id: 'phantom',
    name: 'Phantom',
    type: 'wallet',
    logo: '/logos/phantom.png',
    connectionMethods: ['wallet-connect'],
  },
];

// Generate connected sources (user has 6 connected: 2 blockchains, 2 exchanges, 2 wallets)
const connectedSources = [
  {
    id: 'connected-1',
    userId: MOCK_USER_ID,
    sourceId: 'ethereum',
    sourceName: 'Ethereum',
    sourceType: 'blockchain',
    connectionType: 'wallet-connect',
    label: 'My Main Wallet',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    status: 'connected',
    transactionCount: 150,
    connectedAt: new Date('2024-01-15'),
  },
  {
    id: 'connected-2',
    userId: MOCK_USER_ID,
    sourceId: 'solana',
    sourceName: 'Solana',
    sourceType: 'blockchain',
    connectionType: 'wallet-connect',
    address: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: 'connected',
    transactionCount: 80,
    connectedAt: new Date('2024-02-01'),
  },
  {
    id: 'connected-3',
    userId: MOCK_USER_ID,
    sourceId: 'coinbase',
    sourceName: 'Coinbase',
    sourceType: 'exchange',
    connectionType: 'api-key',
    label: 'Coinbase Pro',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    status: 'connected',
    transactionCount: 200,
    connectedAt: new Date('2023-11-10'),
  },
  {
    id: 'connected-4',
    userId: MOCK_USER_ID,
    sourceId: 'kraken',
    sourceName: 'Kraken',
    sourceType: 'exchange',
    connectionType: 'api-key',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    status: 'connected',
    transactionCount: 100,
    connectedAt: new Date('2024-03-05'),
  },
  {
    id: 'connected-5',
    userId: MOCK_USER_ID,
    sourceId: 'metamask',
    sourceName: 'MetaMask',
    sourceType: 'wallet',
    connectionType: 'wallet-connect',
    address: '0x8a2Bf3c4F5D6E789A01B2C345D67E89F0A1B2C3D',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    status: 'connected',
    transactionCount: 50,
    connectedAt: new Date('2024-01-20'),
  },
  {
    id: 'connected-6',
    userId: MOCK_USER_ID,
    sourceId: 'ledger',
    sourceName: 'Ledger',
    sourceType: 'wallet',
    connectionType: 'wallet-connect',
    label: 'Hardware Wallet',
    address: '0x1A2B3C4D5E6F7890ABCDEF1234567890ABCDEF12',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    status: 'connected',
    transactionCount: 20,
    connectedAt: new Date('2023-12-01'),
  },
];

// Generate transactions
function generateTransactions(count: number) {
  const transactions = [];
  const assets = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'MATIC', 'AVAX', 'DOGE'];
  const types = ['buy', 'sell', 'transfer-in', 'transfer-out', 'self-transfer'];
  const categories = ['uncategorized', 'personal', 'business-expense', 'self-transfer', 'gift'];

  for (let i = 0; i < count; i++) {
    const source = faker.helpers.arrayElement(connectedSources);
    const asset = faker.helpers.arrayElement(assets);
    const type = faker.helpers.arrayElement(types);

    // Edge case: 10% missing prices
    const hasPricing = faker.number.float({ min: 0, max: 1 }) > 0.1;

    // Edge case: Some very large or very small values
    let valueUsd: number | null = null;
    if (hasPricing) {
      const rand = faker.number.float({ min: 0, max: 1 });
      if (rand < 0.15) {
        // Large value
        valueUsd = faker.number.float({ min: 100000, max: 1000000, fractionDigits: 2 });
      } else if (rand < 0.25) {
        // Small value
        valueUsd = faker.number.float({ min: 0.01, max: 1, fractionDigits: 4 });
      } else {
        // Normal value
        valueUsd = faker.number.float({ min: 10, max: 50000, fractionDigits: 2 });
      }
    }

    // 20% need categorization
    const needsCategorization = faker.number.float({ min: 0, max: 1 }) < 0.2;

    transactions.push({
      id: faker.string.uuid(),
      userId: MOCK_USER_ID,
      sourceId: source.id,
      sourceName: source.sourceName,
      date: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }),
      type,
      asset,
      amount: faker.number.float({ min: 0.001, max: 100, fractionDigits: 8 }),
      valueUsd,
      fee: faker.number.float({ min: 0, max: 50, fractionDigits: 4 }),
      feeUsd: hasPricing ? faker.number.float({ min: 0, max: 50, fractionDigits: 2 }) : null,
      txHash: faker.string.hexadecimal({ length: 64, prefix: '0x' }),
      toAddress: faker.string.hexadecimal({ length: 40, prefix: '0x' }),
      fromAddress: faker.string.hexadecimal({ length: 40, prefix: '0x' }),
      category: needsCategorization ? 'uncategorized' : faker.helpers.arrayElement(categories),
      description: needsCategorization ? undefined : faker.lorem.sentence(),
      isCategorized: !needsCategorization,
      isPriced: hasPricing,
      needsReview: needsCategorization || !hasPricing,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Generate tax forms
const taxForms = [
  {
    id: 'form-2024',
    userId: MOCK_USER_ID,
    taxYear: 2024,
    taxMethod: 'FIFO',
    status: 'completed',
    totalGains: 45250.75,
    totalLosses: 12350.25,
    netGainLoss: 32900.5,
    transactionsIncluded: 420,
    files: {
      form8949: '/forms/form-8949-2024.pdf',
      scheduleD: '/forms/schedule-d-2024.pdf',
      detailedCsv: '/forms/detailed-2024.csv',
    },
    generatedAt: new Date('2024-10-15'),
    emailSentAt: new Date('2024-10-15'),
    createdAt: new Date('2024-10-15'),
  },
  {
    id: 'form-2023',
    userId: MOCK_USER_ID,
    taxYear: 2023,
    taxMethod: 'FIFO',
    status: 'completed',
    totalGains: 38750.25,
    totalLosses: 15420.5,
    netGainLoss: 23329.75,
    transactionsIncluded: 385,
    files: {
      form8949: '/forms/form-8949-2023.pdf',
      scheduleD: '/forms/schedule-d-2023.pdf',
      detailedCsv: '/forms/detailed-2023.csv',
    },
    generatedAt: new Date('2024-04-01'),
    emailSentAt: new Date('2024-04-01'),
    createdAt: new Date('2024-04-01'),
  },
];

// Generate 600 transactions
const transactions = generateTransactions(600);

// Write to files
const outputDir = path.join(process.cwd(), '@mock-database');

fs.writeFileSync(
  path.join(outputDir, 'users.json'),
  JSON.stringify([mockUser], null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(outputDir, 'connection-sources.json'),
  JSON.stringify(connectionSources, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(outputDir, 'connected-sources.json'),
  JSON.stringify(connectedSources, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(outputDir, 'transactions.json'),
  JSON.stringify(transactions, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(outputDir, 'forms.json'),
  JSON.stringify(taxForms, null, 2),
  'utf-8'
);

console.log('✅ Mock data generated successfully!');
console.log(`   - 1 user`);
console.log(`   - ${connectionSources.length} connection sources`);
console.log(`   - ${connectedSources.length} connected sources`);
console.log(`   - ${transactions.length} transactions`);
console.log(`   - ${taxForms.length} tax forms`);
