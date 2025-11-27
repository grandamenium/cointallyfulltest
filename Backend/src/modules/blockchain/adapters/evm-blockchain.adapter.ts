import { BaseBlockchainAdapter } from './base-blockchain.adapter';
import {
  IBlockchainAdapter,
  BlockchainTransaction,
} from '../interfaces/IBlockchainAdapter';
import { ChainConfig, ETHERSCAN_V2_BASE_URL } from '../config/chain-config';

export class EvmBlockchainAdapter
  extends BaseBlockchainAdapter
  implements IBlockchainAdapter
{
  constructor(chainConfig: ChainConfig, apiKey: string) {
    super(chainConfig, apiKey);
  }

  validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  getChainName(): string {
    return this.chainConfig.name;
  }

  getChainId(): number {
    return this.chainConfig.chainId;
  }

  async fetchNormalTransactions(
    address: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockchainTransaction[]> {
    const url = this.buildUrl('txlist', address);

    return this.throttledRequest(async () => {
      const response = await this.client.get(url);
      const data = response.data;

      if (this.isRateLimitResponse(data)) {
        throw new Error('Rate limit exceeded');
      }

      if (data.status !== '1' && data.message !== 'No transactions found') {
        if (data.status === '0' && data.message === 'No transactions found') {
          return [];
        }
        this.logger.warn(
          `API response: ${data.message || 'Unknown'} - ${data.result || ''}`,
        );
        return [];
      }

      const transactions = Array.isArray(data.result) ? data.result : [];

      return transactions
        .filter((tx: any) => {
          const txDate = new Date(parseInt(tx.timeStamp) * 1000);
          return txDate >= startDate && txDate <= endDate;
        })
        .map((tx: any) => this.mapNormalTransaction(tx, address));
    });
  }

  async fetchERC20Transfers(
    address: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockchainTransaction[]> {
    const url = this.buildUrl('tokentx', address);

    return this.throttledRequest(async () => {
      const response = await this.client.get(url);
      const data = response.data;

      if (this.isRateLimitResponse(data)) {
        throw new Error('Rate limit exceeded');
      }

      if (data.status !== '1' && data.message !== 'No transactions found') {
        if (data.status === '0' && data.message === 'No transactions found') {
          return [];
        }
        this.logger.warn(
          `API response: ${data.message || 'Unknown'} - ${data.result || ''}`,
        );
        return [];
      }

      const transactions = Array.isArray(data.result) ? data.result : [];

      return transactions
        .filter((tx: any) => {
          const txDate = new Date(parseInt(tx.timeStamp) * 1000);
          return txDate >= startDate && txDate <= endDate;
        })
        .map((tx: any) => this.mapERC20Transaction(tx, address));
    });
  }

  private buildUrl(action: string, address: string): string {
    const params = new URLSearchParams({
      chainid: this.chainConfig.chainId.toString(),
      module: 'account',
      action: action,
      address: address,
      startblock: '0',
      endblock: '99999999',
      sort: 'asc',
      apikey: this.apiKey || '',
    });

    return `${ETHERSCAN_V2_BASE_URL}?${params.toString()}`;
  }

  private mapNormalTransaction(
    tx: any,
    userAddress: string,
  ): BlockchainTransaction {
    const isIncoming = tx.to?.toLowerCase() === userAddress.toLowerCase();

    return {
      id: `normal-${tx.hash}-${tx.nonce || 0}`,
      hash: tx.hash,
      type: 'normal',
      timestamp: new Date(parseInt(tx.timeStamp) * 1000),
      from: tx.from || '',
      to: tx.to || '',
      value: tx.value || '0',
      asset: this.chainConfig.nativeToken,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      isError: tx.isError === '1',
      rawData: {
        ...tx,
        chainId: this.chainConfig.chainId,
        chainName: this.chainConfig.name,
        direction: isIncoming ? 'in' : 'out',
        userAddress: userAddress,
      },
    };
  }

  private mapERC20Transaction(
    tx: any,
    userAddress: string,
  ): BlockchainTransaction {
    const isIncoming = tx.to?.toLowerCase() === userAddress.toLowerCase();

    return {
      id: `erc20-${tx.hash}-${tx.tokenSymbol || 'TOKEN'}-${tx.logIndex || 0}`,
      hash: tx.hash,
      type: 'erc20',
      timestamp: new Date(parseInt(tx.timeStamp) * 1000),
      from: tx.from || '',
      to: tx.to || '',
      value: tx.value || '0',
      asset: tx.tokenSymbol || 'UNKNOWN',
      contractAddress: tx.contractAddress,
      tokenName: tx.tokenName,
      tokenDecimal: tx.tokenDecimal ? parseInt(tx.tokenDecimal) : 18,
      rawData: {
        ...tx,
        chainId: this.chainConfig.chainId,
        chainName: this.chainConfig.name,
        direction: isIncoming ? 'in' : 'out',
        userAddress: userAddress,
      },
    };
  }
}
