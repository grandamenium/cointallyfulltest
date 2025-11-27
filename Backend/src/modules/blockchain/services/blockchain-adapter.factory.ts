import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EvmBlockchainAdapter } from '../adapters/evm-blockchain.adapter';
import { SolanaBlockchainAdapter } from '../adapters/solana-blockchain.adapter';
import { IBlockchainAdapter } from '../interfaces/IBlockchainAdapter';
import {
  EVM_CHAINS,
  ChainConfig,
  getChainByChainId,
} from '../config/chain-config';
import { SOLANA_CONFIG } from '../config/solana-config';

const SOLANA_SOURCE_ID = 'solana';

@Injectable()
export class BlockchainAdapterFactory {
  constructor(private configService: ConfigService) {}

  createAdapter(sourceId: string): IBlockchainAdapter {
    const sourceIdLower = sourceId.toLowerCase();

    if (sourceIdLower === SOLANA_SOURCE_ID) {
      const apiKey = this.configService.get<string>('HELIUS_API_KEY') || '';
      return new SolanaBlockchainAdapter(apiKey);
    }

    const chainConfig = EVM_CHAINS[sourceIdLower];

    if (!chainConfig) {
      throw new Error(`Unsupported blockchain: ${sourceId}`);
    }

    const apiKey = this.configService.get<string>('ETHERSCAN_API_KEY') || '';

    return new EvmBlockchainAdapter(chainConfig, apiKey);
  }

  createAdapterByChainId(chainId: number): IBlockchainAdapter {
    const chainConfig = getChainByChainId(chainId);

    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const apiKey = this.configService.get<string>('ETHERSCAN_API_KEY') || '';

    return new EvmBlockchainAdapter(chainConfig, apiKey);
  }

  getSupportedChains(): ChainConfig[] {
    return Object.values(EVM_CHAINS);
  }

  getSupportedSourceIds(): string[] {
    return [...Object.keys(EVM_CHAINS), SOLANA_SOURCE_ID];
  }

  isSupported(sourceId: string): boolean {
    const sourceIdLower = sourceId.toLowerCase();
    return sourceIdLower in EVM_CHAINS || sourceIdLower === SOLANA_SOURCE_ID;
  }
}
