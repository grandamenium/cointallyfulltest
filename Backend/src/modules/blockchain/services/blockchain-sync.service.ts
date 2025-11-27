import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { BlockchainAdapterFactory } from './blockchain-adapter.factory';
import { BlockchainTransaction } from '../interfaces/IBlockchainAdapter';

@Injectable()
export class BlockchainSyncService {
  private readonly logger = new Logger(BlockchainSyncService.name);

  constructor(
    private prisma: PrismaService,
    private adapterFactory: BlockchainAdapterFactory,
  ) {}

  async syncWallet(
    userId: string,
    connectionId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ transactionsImported: number }> {
    const connectedSource = await this.prisma.connectedSource.findFirst({
      where: { id: connectionId, userId },
    });

    if (!connectedSource) {
      throw new NotFoundException('Wallet connection not found');
    }

    if (connectedSource.sourceType !== 'blockchain') {
      throw new BadRequestException(
        'This connection is not a blockchain wallet',
      );
    }

    if (!connectedSource.address) {
      throw new BadRequestException('No address found for this wallet');
    }

    if (!this.adapterFactory.isSupported(connectedSource.sourceId)) {
      throw new BadRequestException(
        `Blockchain ${connectedSource.sourceId} is not supported`,
      );
    }

    const adapter = this.adapterFactory.createAdapter(connectedSource.sourceId);

    if (!adapter.validateAddress(connectedSource.address)) {
      throw new BadRequestException('Invalid wallet address format');
    }

    this.logger.log(
      `Syncing wallet ${connectedSource.address} on ${connectedSource.sourceName}`,
    );

    let normalTxs: BlockchainTransaction[] = [];
    let erc20Txs: BlockchainTransaction[] = [];

    try {
      normalTxs = await adapter.fetchNormalTransactions(
        connectedSource.address,
        startDate,
        endDate,
      );
      this.logger.log(`Fetched ${normalTxs.length} normal transactions`);
    } catch (error) {
      this.logger.error(`Error fetching normal transactions: ${error.message}`);
    }

    try {
      erc20Txs = await adapter.fetchERC20Transfers(
        connectedSource.address,
        startDate,
        endDate,
      );
      this.logger.log(`Fetched ${erc20Txs.length} ERC20 transfers`);
    } catch (error) {
      this.logger.error(`Error fetching ERC20 transfers: ${error.message}`);
    }

    const allTransactions = [...normalTxs, ...erc20Txs];

    let importedCount = 0;

    for (const tx of allTransactions) {
      try {
        await this.prisma.rawTransaction.upsert({
          where: {
            source_externalId: {
              source: connectedSource.sourceName,
              externalId: tx.id,
            },
          },
          create: {
            userId,
            externalId: tx.id,
            source: connectedSource.sourceName,
            rawData: {
              ...tx.rawData,
              txType: tx.type,
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              asset: tx.asset,
              timestamp: tx.timestamp.toISOString(),
              userAddress: connectedSource.address,
              contractAddress: tx.contractAddress,
              tokenName: tx.tokenName,
              tokenDecimal: tx.tokenDecimal,
              gasUsed: tx.gasUsed,
              gasPrice: tx.gasPrice,
              isError: tx.isError,
            },
          },
          update: {
            rawData: {
              ...tx.rawData,
              txType: tx.type,
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              asset: tx.asset,
              timestamp: tx.timestamp.toISOString(),
              userAddress: connectedSource.address,
              contractAddress: tx.contractAddress,
              tokenName: tx.tokenName,
              tokenDecimal: tx.tokenDecimal,
              gasUsed: tx.gasUsed,
              gasPrice: tx.gasPrice,
              isError: tx.isError,
            },
            processedAt: null,
          },
        });
        importedCount++;
      } catch (error) {
        this.logger.error(
          `Error storing transaction ${tx.id}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Imported ${importedCount} transactions for wallet ${connectedSource.address}`,
    );

    return {
      transactionsImported: importedCount,
    };
  }

  async validateAddress(sourceId: string, address: string): Promise<boolean> {
    if (!this.adapterFactory.isSupported(sourceId)) {
      return false;
    }

    const adapter = this.adapterFactory.createAdapter(sourceId);
    return adapter.validateAddress(address);
  }
}
