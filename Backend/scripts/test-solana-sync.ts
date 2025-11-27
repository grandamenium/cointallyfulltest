import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

import { SolanaBlockchainAdapter } from '../src/modules/blockchain/adapters/solana-blockchain.adapter';

const TEST_WALLET = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';

async function main() {
  const apiKey = process.env.HELIUS_API_KEY;

  if (!apiKey) {
    console.error('HELIUS_API_KEY not found in .env');
    process.exit(1);
  }

  console.log('Helius API Key:', apiKey.substring(0, 8) + '...');

  const adapter = new SolanaBlockchainAdapter(apiKey);

  console.log('\n--- Address Validation ---');
  const validAddresses = [
    TEST_WALLET,
    '11111111111111111111111111111111',
    'So11111111111111111111111111111111111111112',
  ];
  const invalidAddresses = [
    '0x1234567890abcdef1234567890abcdef12345678',
    'invalid',
    '',
  ];

  for (const addr of validAddresses) {
    const isValid = adapter.validateAddress(addr);
    console.log(`  ${addr.substring(0, 20)}... => ${isValid ? 'VALID' : 'INVALID'}`);
  }

  for (const addr of invalidAddresses) {
    const isValid = adapter.validateAddress(addr);
    console.log(`  ${addr || '(empty)'} => ${isValid ? 'VALID' : 'INVALID'}`);
  }

  console.log('\n--- Chain Info ---');
  console.log('  Chain Name:', adapter.getChainName());
  console.log('  Chain ID:', adapter.getChainId());

  console.log('\n--- Fetching Transactions ---');
  console.log('  Wallet:', TEST_WALLET);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  console.log('  Date Range:', startDate.toISOString(), 'to', endDate.toISOString());

  try {
    console.log('\n  Fetching SOL transfers...');
    const solTransfers = await adapter.fetchNormalTransactions(
      TEST_WALLET,
      startDate,
      endDate,
    );
    console.log(`  Found ${solTransfers.length} SOL transfers`);

    if (solTransfers.length > 0) {
      console.log('\n  Sample SOL transfer:');
      const sample = solTransfers[0];
      console.log(`    ID: ${sample.id}`);
      console.log(`    Hash: ${sample.hash.substring(0, 20)}...`);
      console.log(`    Type: ${sample.type}`);
      console.log(`    From: ${sample.from.substring(0, 20)}...`);
      console.log(`    To: ${sample.to.substring(0, 20)}...`);
      console.log(`    Value: ${sample.value} ${sample.asset}`);
      console.log(`    Date: ${sample.timestamp.toISOString()}`);
    }

    console.log('\n  Fetching SPL token transfers...');
    const splTransfers = await adapter.fetchERC20Transfers(
      TEST_WALLET,
      startDate,
      endDate,
    );
    console.log(`  Found ${splTransfers.length} SPL/Swap transfers`);

    const swaps = splTransfers.filter((tx) => tx.type === 'swap');
    const tokens = splTransfers.filter((tx) => tx.type === 'spl');
    console.log(`    - Swaps: ${swaps.length}`);
    console.log(`    - SPL Tokens: ${tokens.length}`);

    if (swaps.length > 0) {
      console.log('\n  Sample Swap:');
      const swap = swaps[0];
      console.log(`    ID: ${swap.id}`);
      console.log(`    Hash: ${swap.hash.substring(0, 20)}...`);
      if (swap.swapData) {
        console.log(`    Input: ${swap.swapData.inputAmount} ${swap.swapData.inputAsset.substring(0, 10)}...`);
        console.log(`    Output: ${swap.swapData.outputAmount} ${swap.swapData.outputAsset.substring(0, 10)}...`);
      }
      console.log(`    Date: ${swap.timestamp.toISOString()}`);
    }

    if (tokens.length > 0) {
      console.log('\n  Sample SPL Transfer:');
      const token = tokens[0];
      console.log(`    ID: ${token.id}`);
      console.log(`    Hash: ${token.hash.substring(0, 20)}...`);
      console.log(`    Asset: ${token.asset}`);
      console.log(`    Value: ${token.value}`);
      console.log(`    Contract: ${token.contractAddress?.substring(0, 20)}...`);
      console.log(`    Date: ${token.timestamp.toISOString()}`);
    }

    console.log('\n--- Summary ---');
    console.log(`  Total SOL transfers: ${solTransfers.length}`);
    console.log(`  Total SPL transfers: ${tokens.length}`);
    console.log(`  Total Swaps: ${swaps.length}`);
    console.log(`  Grand Total: ${solTransfers.length + splTransfers.length}`);

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
  } catch (error: any) {
    console.error('\nError fetching transactions:', error.message);
    if (error.response?.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
