import { BaseBlockchainAdapter } from './base-blockchain.adapter';
import {
  IBlockchainAdapter,
  BlockchainTransaction,
} from '../interfaces/IBlockchainAdapter';
import {
  SOLANA_CONFIG,
  HELIUS_API_BASE_URL,
  HeliusTransaction,
  HeliusNativeTransfer,
  HeliusTokenTransfer,
} from '../config/solana-config';

export class SolanaBlockchainAdapter
  extends BaseBlockchainAdapter
  implements IBlockchainAdapter
{
  private cachedTransactions: Map<string, BlockchainTransaction[]> = new Map();

  constructor(apiKey: string) {
    super(
      {
        chainId: 0,
        name: SOLANA_CONFIG.name,
        sourceId: SOLANA_CONFIG.sourceId,
        nativeToken: SOLANA_CONFIG.nativeToken,
        decimals: SOLANA_CONFIG.decimals,
      },
      apiKey,
    );
  }

  validateAddress(address: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }

  getChainName(): string {
    return SOLANA_CONFIG.name;
  }

  getChainId(): number | null {
    return null;
  }

  async fetchNormalTransactions(
    address: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockchainTransaction[]> {
    const allTransactions = await this.fetchAllTransactions(
      address,
      startDate,
      endDate,
    );
    return allTransactions.filter((tx) => tx.type === 'sol-transfer');
  }

  async fetchERC20Transfers(
    address: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockchainTransaction[]> {
    const allTransactions = await this.fetchAllTransactions(
      address,
      startDate,
      endDate,
    );
    return allTransactions.filter(
      (tx) => tx.type === 'spl' || tx.type === 'swap',
    );
  }

  private async fetchAllTransactions(
    address: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockchainTransaction[]> {
    const cacheKey = `${address}-${startDate.toISOString()}-${endDate.toISOString()}`;

    if (this.cachedTransactions.has(cacheKey)) {
      return this.cachedTransactions.get(cacheKey)!;
    }

    const allTxs: BlockchainTransaction[] = [];
    let lastSignature: string | undefined;
    const maxTransactions = 10000;

    while (allTxs.length < maxTransactions) {
      const params = new URLSearchParams({
        'api-key': this.apiKey,
        limit: '100',
      });

      if (lastSignature) {
        params.append('before', lastSignature);
      }

      const url = `${HELIUS_API_BASE_URL}/addresses/${address}/transactions?${params.toString()}`;

      const response = await this.throttledRequest(async () => {
        const res = await this.client.get<HeliusTransaction[]>(url);
        return res;
      });

      const transactions = response.data;

      if (!transactions || transactions.length === 0) {
        break;
      }

      for (const tx of transactions) {
        const txDate = new Date(tx.timestamp * 1000);

        if (txDate < startDate) {
          this.cachedTransactions.set(cacheKey, allTxs);
          return allTxs;
        }

        if (txDate <= endDate) {
          const mappedTxs = this.mapHeliusTransaction(tx, address);
          allTxs.push(...mappedTxs);
        }
      }

      lastSignature = transactions[transactions.length - 1].signature;

      if (transactions.length < 100) {
        break;
      }
    }

    this.cachedTransactions.set(cacheKey, allTxs);
    return allTxs;
  }

  private mapHeliusTransaction(
    tx: HeliusTransaction,
    userAddress: string,
  ): BlockchainTransaction[] {
    const results: BlockchainTransaction[] = [];
    const timestamp = new Date(tx.timestamp * 1000);

    if (tx.type === 'SWAP' && tx.events?.swap) {
      const swapTx = this.mapSwapTransaction(tx, userAddress, timestamp);
      if (swapTx) {
        results.push(swapTx);
      }
      return results;
    }

    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      const solTxs = this.mapNativeTransfers(
        tx,
        userAddress,
        timestamp,
        tx.nativeTransfers,
      );
      results.push(...solTxs);
    }

    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      const splTxs = this.mapTokenTransfers(
        tx,
        userAddress,
        timestamp,
        tx.tokenTransfers,
      );
      results.push(...splTxs);
    }

    if (results.length === 0 && tx.nativeTransfers) {
      const fallbackTxs = this.mapNativeTransfers(
        tx,
        userAddress,
        timestamp,
        tx.nativeTransfers,
      );
      results.push(...fallbackTxs);
    }

    return results;
  }

  private mapSwapTransaction(
    tx: HeliusTransaction,
    userAddress: string,
    timestamp: Date,
  ): BlockchainTransaction | null {
    const swap = tx.events?.swap;
    if (!swap) return null;

    let inputAsset = 'SOL';
    let inputAmount = '0';
    let outputAsset = 'SOL';
    let outputAmount = '0';

    if (swap.nativeInput) {
      inputAsset = 'SOL';
      inputAmount = this.lamportsToSol(swap.nativeInput.amount);
    } else if (swap.tokenInputs && swap.tokenInputs.length > 0) {
      const input = swap.tokenInputs[0];
      inputAsset = input.mint;
      inputAmount = this.parseTokenAmount(
        input.rawTokenAmount.tokenAmount,
        input.rawTokenAmount.decimals,
      );
    }

    if (swap.nativeOutput) {
      outputAsset = 'SOL';
      outputAmount = this.lamportsToSol(swap.nativeOutput.amount);
    } else if (swap.tokenOutputs && swap.tokenOutputs.length > 0) {
      const output = swap.tokenOutputs[0];
      outputAsset = output.mint;
      outputAmount = this.parseTokenAmount(
        output.rawTokenAmount.tokenAmount,
        output.rawTokenAmount.decimals,
      );
    }

    return {
      id: `swap-${tx.signature}`,
      hash: tx.signature,
      type: 'swap',
      timestamp,
      from: userAddress,
      to: userAddress,
      value: inputAmount,
      asset: inputAsset,
      rawData: {
        ...tx,
        chainName: SOLANA_CONFIG.name,
        userAddress,
        heliusType: tx.type,
      },
      swapData: {
        inputAsset,
        inputAmount,
        outputAsset,
        outputAmount,
      },
    };
  }

  private mapNativeTransfers(
    tx: HeliusTransaction,
    userAddress: string,
    timestamp: Date,
    transfers: HeliusNativeTransfer[],
  ): BlockchainTransaction[] {
    const results: BlockchainTransaction[] = [];
    const userAddressLower = userAddress.toLowerCase();

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      const isIncoming =
        transfer.toUserAccount?.toLowerCase() === userAddressLower;
      const isOutgoing =
        transfer.fromUserAccount?.toLowerCase() === userAddressLower;

      if (!isIncoming && !isOutgoing) continue;

      if (transfer.amount === 0) continue;

      results.push({
        id: `sol-${tx.signature}-${i}`,
        hash: tx.signature,
        type: 'sol-transfer',
        timestamp,
        from: transfer.fromUserAccount || '',
        to: transfer.toUserAccount || '',
        value: this.lamportsToSol(transfer.amount.toString()),
        asset: 'SOL',
        rawData: {
          ...tx,
          chainName: SOLANA_CONFIG.name,
          direction: isIncoming ? 'in' : 'out',
          userAddress,
          heliusType: tx.type,
        },
      });
    }

    return results;
  }

  private mapTokenTransfers(
    tx: HeliusTransaction,
    userAddress: string,
    timestamp: Date,
    transfers: HeliusTokenTransfer[],
  ): BlockchainTransaction[] {
    const results: BlockchainTransaction[] = [];
    const userAddressLower = userAddress.toLowerCase();

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      const isIncoming =
        transfer.toUserAccount?.toLowerCase() === userAddressLower;
      const isOutgoing =
        transfer.fromUserAccount?.toLowerCase() === userAddressLower;

      if (!isIncoming && !isOutgoing) continue;

      if (transfer.tokenAmount === 0) continue;

      const symbol = transfer.symbol || this.shortenMint(transfer.mint);

      results.push({
        id: `spl-${tx.signature}-${transfer.mint}-${i}`,
        hash: tx.signature,
        type: 'spl',
        timestamp,
        from: transfer.fromUserAccount || '',
        to: transfer.toUserAccount || '',
        value: transfer.tokenAmount.toString(),
        asset: symbol,
        contractAddress: transfer.mint,
        tokenName: transfer.tokenName,
        tokenDecimal: transfer.decimals,
        rawData: {
          ...tx,
          chainName: SOLANA_CONFIG.name,
          direction: isIncoming ? 'in' : 'out',
          userAddress,
          mint: transfer.mint,
          heliusType: tx.type,
        },
      });
    }

    return results;
  }

  private lamportsToSol(lamports: string | number): string {
    const lamportsNum =
      typeof lamports === 'string' ? parseInt(lamports, 10) : lamports;
    return (lamportsNum / 1_000_000_000).toString();
  }

  private parseTokenAmount(amount: string, decimals: number): string {
    const amountNum = parseFloat(amount);
    return (amountNum / Math.pow(10, decimals)).toString();
  }

  private shortenMint(mint: string): string {
    if (mint.length <= 8) return mint;
    return `${mint.slice(0, 4)}...${mint.slice(-4)}`;
  }
}
