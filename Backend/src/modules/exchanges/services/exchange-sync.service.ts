import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { EncryptionService } from '../../../common/services/encryption.service';
import { IExchangeAdapter, ExchangeCredentials, SyncProgressCallback } from '../interfaces/IExchangeAdapter';
import { CoinbaseAdapter } from '../adapters/coinbase.adapter';
import { BinanceAdapter } from '../adapters/binance.adapter';
import { KrakenAdapter } from '../adapters/kraken.adapter';
import { BybitAdapter } from '../adapters/bybit.adapter';
import { OkxAdapter } from '../adapters/okx.adapter';
import { KucoinAdapter } from '../adapters/kucoin.adapter';
import { GateioAdapter } from '../adapters/gateio.adapter';
import { MexcAdapter } from '../adapters/mexc.adapter';
import { ConnectExchangeDto } from '../dto/connect-exchange.dto';

@Injectable()
export class ExchangeSyncService {
  private adapters: Map<string, IExchangeAdapter>;

  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
    private coinbaseAdapter: CoinbaseAdapter,
    private binanceAdapter: BinanceAdapter,
    private krakenAdapter: KrakenAdapter,
    private bybitAdapter: BybitAdapter,
    private okxAdapter: OkxAdapter,
    private kucoinAdapter: KucoinAdapter,
    private gateioAdapter: GateioAdapter,
    private mexcAdapter: MexcAdapter,
  ) {
    this.adapters = new Map<string, any>([
      ['coinbase', this.coinbaseAdapter],
      ['binance', this.binanceAdapter],
      ['kraken', this.krakenAdapter],
      ['bybit', this.bybitAdapter],
      ['okx', this.okxAdapter],
      ['kucoin', this.kucoinAdapter],
      ['gateio', this.gateioAdapter],
      ['mexc', this.mexcAdapter],
    ]);
  }

  async connectExchange(userId: string, dto: ConnectExchangeDto) {
    const adapter = this.getAdapter(dto.exchangeName);

    const credentials: ExchangeCredentials = {
      apiKey: dto.apiKey,
      apiSecret: dto.apiSecret,
      passphrase: dto.passphrase,
      additionalConfig: dto.additionalConfig,
    };

    const isValid = await adapter.testConnection(credentials);
    if (!isValid) {
      throw new BadRequestException('Invalid exchange credentials');
    }

    const encryptedApiKey = this.encryption.encrypt(dto.apiKey);
    const encryptedApiSecret = this.encryption.encrypt(dto.apiSecret);
    const encryptedPassphrase = dto.passphrase
      ? this.encryption.encrypt(dto.passphrase)
      : null;

    const connection = await this.prisma.exchangeConnection.create({
      data: {
        userId,
        exchangeName: dto.exchangeName,
        displayName: dto.displayName || dto.exchangeName,
        encryptedApiKey,
        encryptedApiSecret,
        encryptedPassphrase,
        additionalConfig: dto.additionalConfig,
      },
    });

    return {
      id: connection.id,
      exchangeName: connection.exchangeName,
      displayName: connection.displayName,
      isActive: connection.isActive,
      createdAt: connection.createdAt,
    };
  }

  async disconnectExchange(userId: string, connectionId: string) {
    const connection = await this.prisma.exchangeConnection.findFirst({
      where: { id: connectionId, userId },
    });

    if (!connection) {
      throw new NotFoundException('Exchange connection not found');
    }

    await this.prisma.exchangeConnection.delete({
      where: { id: connectionId },
    });

    return { message: 'Exchange disconnected successfully' };
  }

  async getExchangeConnections(userId: string) {
    const connections = await this.prisma.exchangeConnection.findMany({
      where: { userId },
      select: {
        id: true,
        exchangeName: true,
        displayName: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return connections;
  }

  async syncExchange(
    userId: string,
    connectionId: string,
    startDate: Date,
    endDate: Date,
    onProgress?: SyncProgressCallback,
  ) {
    const connectedSource = await this.prisma.connectedSource.findFirst({
      where: {
        id: connectionId,
        userId,
        sourceType: 'exchange'
      },
    });

    if (!connectedSource) {
      throw new NotFoundException('Exchange connection not found');
    }

    if (!connectedSource.encryptedCredentials) {
      throw new BadRequestException('No credentials found for this exchange');
    }

    const adapter = this.getAdapter(connectedSource.sourceName);
    const credentials = this.decryptCredentialsFromJson(connectedSource.encryptedCredentials);

    try {
      const transactions = await adapter.syncTransactions(credentials, startDate, endDate, onProgress);

      for (const tx of transactions) {
        await this.prisma.rawTransaction.upsert({
          where: {
            source_externalId: {
              source: connectedSource.sourceName,
              externalId: tx.id,
            },
          },
          create: {
            userId,
            exchangeConnectionId: null,
            externalId: tx.id,
            source: connectedSource.sourceName,
            rawData: tx.data,
          },
          update: {
            rawData: tx.data,
          },
        });
      }

      await this.prisma.connectedSource.update({
        where: { id: connectionId },
        data: { lastSyncedAt: new Date() },
      });

      return {
        status: 'completed',
        transactionsImported: transactions.length,
      };
    } catch (error) {
      throw error;
    }
  }

  private getAdapter(exchangeName: string): IExchangeAdapter {
    const adapter = this.adapters.get(exchangeName.toLowerCase());
    if (!adapter) {
      throw new BadRequestException(`Exchange ${exchangeName} is not supported`);
    }
    return adapter;
  }

  private decryptCredentials(connection: any): ExchangeCredentials {
    return {
      apiKey: this.encryption.decrypt(connection.encryptedApiKey),
      apiSecret: this.encryption.decrypt(connection.encryptedApiSecret),
      passphrase: connection.encryptedPassphrase
        ? this.encryption.decrypt(connection.encryptedPassphrase)
        : undefined,
      additionalConfig: connection.additionalConfig,
    };
  }

  private decryptCredentialsFromJson(encryptedCredentials: string): ExchangeCredentials {
    const decrypted = this.encryption.decrypt(encryptedCredentials);
    const credentials = JSON.parse(decrypted);

    return {
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      passphrase: credentials.passphrase,
      additionalConfig: credentials.additionalConfig,
    };
  }
}
