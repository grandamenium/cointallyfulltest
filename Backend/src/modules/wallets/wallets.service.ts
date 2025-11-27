import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/services/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { ConnectSourceDto } from './dto/connect-source.dto';
import { CsvParserService } from './csv-parser.service';

@Injectable()
export class WalletsService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
    private csvParser: CsvParserService,
    @InjectQueue('sync-queue') private syncQueue: Queue,
  ) {}

  // Get all available connection sources
  async getAvailableSources() {
    return this.prisma.connectionSource.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        logo: true,
        connectionMethods: true,
      },
    });
  }

  // Get user's connected sources
  async getConnectedSources(userId: string) {
    const sources = await this.prisma.connectedSource.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        sourceId: true,
        sourceName: true,
        sourceType: true,
        connectionType: true,
        label: true,
        address: true,
        lastSyncedAt: true,
        status: true,
        transactionCount: true,
        connectedAt: true,
        createdAt: true,
      },
      orderBy: { connectedAt: 'desc' },
    });

    return sources.map((source) => ({
      ...source,
      lastSyncedAt: source.lastSyncedAt || source.createdAt,
    }));
  }

  // Connect a new source
  async connectSource(userId: string, dto: ConnectSourceDto) {
    // Validate that the source exists
    const source = await this.prisma.connectionSource.findUnique({
      where: { id: dto.sourceId },
    });

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    // Validate connection method is supported
    const methods = source.connectionMethods as any[];
    if (!methods.includes(dto.connectionType)) {
      throw new BadRequestException(
        `Connection method ${dto.connectionType} not supported for ${source.name}`,
      );
    }

    // Check if already connected (for wallet addresses)
    if (dto.credentials.address) {
      const existing = await this.prisma.connectedSource.findFirst({
        where: {
          userId,
          sourceId: dto.sourceId,
          address: dto.credentials.address,
        },
      });

      if (existing) {
        throw new ConflictException('This wallet address is already connected');
      }
    }

    // Encrypt credentials if provided
    let encryptedCredentials: string | null = null;
    if (dto.credentials.apiKey || dto.credentials.apiSecret) {
      encryptedCredentials = this.encryption.encrypt(JSON.stringify(dto.credentials));
    }

    // Create the connected source
    const connectedSource = await this.prisma.connectedSource.create({
      data: {
        userId,
        sourceId: dto.sourceId,
        sourceName: source.name,
        sourceType: source.type,
        connectionType: dto.connectionType,
        address: dto.credentials.address,
        encryptedCredentials,
      },
    });

    return {
      success: true,
      data: connectedSource,
      message: `${source.name} connected successfully`,
    };
  }

  // Disconnect a source
  async disconnectSource(userId: string, id: string) {
    const connectedSource = await this.prisma.connectedSource.findFirst({
      where: { id, userId },
    });

    if (!connectedSource) {
      throw new NotFoundException('Connected source not found');
    }

    await this.prisma.connectedSource.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }

  // Resync a source (trigger background job)
  async resyncSource(userId: string, id: string) {
    const connectedSource = await this.prisma.connectedSource.findFirst({
      where: { id, userId },
    });

    if (!connectedSource) {
      throw new NotFoundException('Connected source not found');
    }

    // Update status to syncing
    await this.prisma.connectedSource.update({
      where: { id },
      data: { status: 'syncing' },
    });

    // Create a sync job
    const syncJob = await this.prisma.syncJob.create({
      data: {
        connectedSourceId: id,
        type: connectedSource.sourceType === 'exchange' ? 'exchange-sync' : 'wallet-sync',
        status: 'processing',
        progress: 0,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { taxInfo: true },
    });

    const taxInfo = user?.taxInfo as any;
    const taxYear = taxInfo?.filingYear || new Date().getFullYear();

    const startDate = new Date(taxYear, 0, 1);
    const endDate = new Date(taxYear, 11, 31, 23, 59, 59, 999);

    const jobType = connectedSource.sourceType === 'blockchain' ? 'sync-wallet' : 'sync-exchange';

    const bullJob = await this.syncQueue.add(jobType, {
      userId,
      connectionId: id,
      syncJobId: syncJob.id,
      startDate,
      endDate,
    });

    await this.prisma.syncJob.update({
      where: { id: syncJob.id },
      data: { bullJobId: bullJob.id.toString() },
    });

    return {
      success: true,
      message: 'Sync initiated',
      jobId: bullJob.id.toString(),
    };
  }

  async uploadCsv(userId: string, sourceId: string, file: Express.Multer.File) {
    const source = await this.prisma.connectionSource.findUnique({
      where: { id: sourceId },
    });

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    const csvContent = file.buffer.toString('utf-8');

    const parseResult = await this.csvParser.parseExchangeCsv(csvContent, sourceId);

    if (parseResult.errors.length > 0 && parseResult.successfulRows === 0) {
      throw new BadRequestException({
        message: 'Failed to parse CSV file',
        errors: parseResult.errors,
      });
    }

    const connectedSource = await this.prisma.connectedSource.create({
      data: {
        userId,
        sourceId,
        sourceName: source.name,
        sourceType: source.type,
        connectionType: 'csv-upload',
        transactionCount: parseResult.successfulRows,
      },
    });

    const transactions = parseResult.transactions.map((tx) => ({
      userId,
      sourceId: connectedSource.id,
      sourceName: source.name,
      date: tx.timestamp,
      type: tx.type,
      asset: tx.asset,
      amount: tx.amount.toString(),
      valueUsd: tx.price?.toString(),
      fee: tx.fee?.toString(),
      description: tx.notes,
      category: 'uncategorized',
    }));

    if (transactions.length > 0) {
      await this.prisma.transaction.createMany({
        data: transactions,
      });
    }

    await this.prisma.connectedSource.update({
      where: { id: connectedSource.id },
      data: {
        lastSyncedAt: new Date(),
        status: 'connected',
      },
    });

    return {
      success: true,
      data: {
        connectedSourceId: connectedSource.id,
        totalRows: parseResult.totalRows,
        successfulRows: parseResult.successfulRows,
        errors: parseResult.errors,
        transactionsImported: transactions.length,
      },
      message: `CSV uploaded successfully. ${parseResult.successfulRows} transactions imported.`,
    };
  }
}
