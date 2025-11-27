import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectionSources = [
  // Blockchains
  {
    id: 'ethereum',
    name: 'Ethereum',
    type: 'blockchain',
    logo: '/logos/ethereum.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    type: 'blockchain',
    logo: '/logos/bitcoin.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'solana',
    name: 'Solana',
    type: 'blockchain',
    logo: '/logos/solana.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'polygon',
    name: 'Polygon',
    type: 'blockchain',
    logo: '/logos/polygon.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    type: 'blockchain',
    logo: '/logos/bnb.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    type: 'blockchain',
    logo: '/logos/arbitrum.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'optimism',
    name: 'Optimism',
    type: 'blockchain',
    logo: '/logos/optimism.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'avalanche',
    name: 'Avalanche C-Chain',
    type: 'blockchain',
    logo: '/logos/avalanche.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'base',
    name: 'Base',
    type: 'blockchain',
    logo: '/logos/base.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  // Exchanges
  {
    id: 'coinbase',
    name: 'Coinbase',
    type: 'exchange',
    logo: '/logos/coinbase.svg',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'binance',
    name: 'Binance',
    type: 'exchange',
    logo: '/logos/binance.svg',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'kraken',
    name: 'Kraken',
    type: 'exchange',
    logo: '/logos/kraken.svg',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'bybit',
    name: 'Bybit',
    type: 'exchange',
    logo: '/logos/bybit.svg',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'okx',
    name: 'OKX',
    type: 'exchange',
    logo: '/logos/okx.svg',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'kucoin',
    name: 'KuCoin',
    type: 'exchange',
    logo: '/logos/kucoin.svg',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'gateio',
    name: 'Gate.io',
    type: 'exchange',
    logo: '/logos/gateio.svg',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  {
    id: 'mexc',
    name: 'MEXC',
    type: 'exchange',
    logo: '/logos/mexc.svg',
    connectionMethods: ['api-key', 'csv-upload'],
  },
  // Wallets
  {
    id: 'metamask',
    name: 'MetaMask',
    type: 'wallet',
    logo: '/logos/metamask.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'ledger',
    name: 'Ledger',
    type: 'wallet',
    logo: '/logos/ledger.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
  {
    id: 'phantom',
    name: 'Phantom',
    type: 'wallet',
    logo: '/logos/phantom.svg',
    connectionMethods: ['wallet-connect', 'csv-upload'],
  },
];

async function main() {
  console.log('Seeding connection sources...');

  for (const source of connectionSources) {
    await prisma.connectionSource.upsert({
      where: { id: source.id },
      update: source,
      create: source,
    });
    console.log(`✓ Seeded ${source.name}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
