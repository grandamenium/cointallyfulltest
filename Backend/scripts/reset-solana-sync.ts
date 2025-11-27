import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetSolanaSync() {
  console.log('Resetting Solana transaction sync...');

  const deletedNormalized = await prisma.normalizedTransaction.deleteMany({
    where: {
      source: 'Solana',
    },
  });
  console.log(`Deleted ${deletedNormalized.count} NormalizedTransaction records with source 'Solana'`);

  const updatedRaw = await prisma.rawTransaction.updateMany({
    where: {
      source: 'Solana',
    },
    data: {
      processedAt: null,
    },
  });
  console.log(`Reset processedAt on ${updatedRaw.count} RawTransaction records`);

  console.log('Done! Now resync the Solana wallet from the frontend.');
}

resetSolanaSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
