import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../../common/services/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly apiKey: string;
  private coinListCache: Map<string, string> = new Map();
  private cacheExpiry: number = 0;

  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {
    this.apiKey = process.env.COINGECKO_API_KEY || '';
  }

  async getCoinId(symbol: string): Promise<string | null> {
    await this.refreshCoinListCache();

    const normalizedSymbol = symbol.toLowerCase();
    return this.coinListCache.get(normalizedSymbol) || null;
  }

  async getHistoricalPrice(
    symbol: string,
    timestamp: Date,
    currency: string = 'usd',
  ): Promise<number | null> {
    try {
      const asset = await this.prisma.asset.findUnique({
        where: { symbol: symbol.toUpperCase() },
      });

      if (!asset || !asset.coingeckoId) {
        this.logger.warn(`Asset ${symbol} not found or missing CoinGecko ID`);
        return null;
      }

      const existingPrice = await this.prisma.priceHistory.findUnique({
        where: {
          assetId_timestamp_source: {
            assetId: asset.id,
            timestamp: this.normalizeTimestamp(timestamp),
            source: 'coingecko',
          },
        },
      });

      if (existingPrice) {
        return parseFloat(existingPrice.priceUsd.toString());
      }

      const price = await this.fetchHistoricalPrice(asset.coingeckoId, timestamp, currency);

      if (price) {
        await this.prisma.priceHistory.create({
          data: {
            assetId: asset.id,
            timestamp: this.normalizeTimestamp(timestamp),
            priceUsd: price,
            priceEur: currency === 'eur' ? price : null,
            source: 'coingecko',
          },
        });
      }

      return price;
    } catch (error) {
      this.logger.error(`Error getting price for ${symbol}:`, error.message);
      return null;
    }
  }

  async getHistoricalPriceRange(
    symbol: string,
    startDate: Date,
    endDate: Date,
    currency: string = 'usd',
  ): Promise<Array<{ timestamp: Date; price: number }>> {
    try {
      const asset = await this.prisma.asset.findUnique({
        where: { symbol: symbol.toUpperCase() },
      });

      if (!asset || !asset.coingeckoId) {
        this.logger.warn(`Asset ${symbol} not found or missing CoinGecko ID`);
        return [];
      }

      const prices = await this.fetchHistoricalPriceRange(
        asset.coingeckoId,
        startDate,
        endDate,
        currency,
      );

      for (const { timestamp, price } of prices) {
        await this.prisma.priceHistory.upsert({
          where: {
            assetId_timestamp_source: {
              assetId: asset.id,
              timestamp: this.normalizeTimestamp(timestamp),
              source: 'coingecko',
            },
          },
          create: {
            assetId: asset.id,
            timestamp: this.normalizeTimestamp(timestamp),
            priceUsd: price,
            priceEur: currency === 'eur' ? price : null,
            source: 'coingecko',
          },
          update: {
            priceUsd: price,
            priceEur: currency === 'eur' ? price : null,
          },
        });
      }

      return prices;
    } catch (error) {
      this.logger.error(`Error getting price range for ${symbol}:`, error.message);
      return [];
    }
  }

  async syncAsset(symbol: string): Promise<void> {
    const coingeckoId = await this.getCoinId(symbol);

    if (!coingeckoId) {
      this.logger.warn(`Could not find CoinGecko ID for ${symbol}`);
      return;
    }

    const coinData = await this.fetchCoinData(coingeckoId);

    if (coinData) {
      await this.prisma.asset.upsert({
        where: { symbol: symbol.toUpperCase() },
        create: {
          symbol: symbol.toUpperCase(),
          name: coinData.name,
          coingeckoId: coinData.id,
          assetType: 'crypto',
          metadata: coinData,
        },
        update: {
          name: coinData.name,
          coingeckoId: coinData.id,
          metadata: coinData,
        },
      });
    }
  }

  private async refreshCoinListCache(): Promise<void> {
    const now = Date.now();
    if (now < this.cacheExpiry) {
      return;
    }

    try {
      const headers = this.apiKey ? { 'x-cg-pro-api-key': this.apiKey } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/coins/list`, { headers }),
      );

      this.coinListCache.clear();
      for (const coin of response.data) {
        this.coinListCache.set(coin.symbol.toLowerCase(), coin.id);
      }

      this.cacheExpiry = now + 24 * 60 * 60 * 1000;
      this.logger.log(`Refreshed CoinGecko coin list: ${this.coinListCache.size} coins`);
    } catch (error) {
      this.logger.error('Error refreshing coin list:', error.message);
    }
  }

  private async fetchHistoricalPrice(
    coingeckoId: string,
    timestamp: Date,
    currency: string,
  ): Promise<number | null> {
    try {
      const date = this.formatDate(timestamp);
      const headers = this.apiKey ? { 'x-cg-pro-api-key': this.apiKey } : {};

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/coins/${coingeckoId}/history`, {
          params: { date, localization: false },
          headers,
        }),
      );

      return response.data.market_data?.current_price?.[currency] || null;
    } catch (error) {
      this.logger.warn(`Error fetching historical price for ${coingeckoId}:`, error.message);
      return null;
    }
  }

  private async fetchHistoricalPriceRange(
    coingeckoId: string,
    startDate: Date,
    endDate: Date,
    currency: string,
  ): Promise<Array<{ timestamp: Date; price: number }>> {
    try {
      const from = Math.floor(startDate.getTime() / 1000);
      const to = Math.floor(endDate.getTime() / 1000);
      const headers = this.apiKey ? { 'x-cg-pro-api-key': this.apiKey } : {};

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/coins/${coingeckoId}/market_chart/range`, {
          params: { vs_currency: currency, from, to },
          headers,
        }),
      );

      return response.data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp: new Date(timestamp),
        price,
      }));
    } catch (error) {
      this.logger.warn(`Error fetching price range for ${coingeckoId}:`, error.message);
      return [];
    }
  }

  private async fetchCoinData(coingeckoId: string): Promise<any> {
    try {
      const headers = this.apiKey ? { 'x-cg-pro-api-key': this.apiKey } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/coins/${coingeckoId}`, {
          params: { localization: false, tickers: false, community_data: false, developer_data: false },
          headers,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.warn(`Error fetching coin data for ${coingeckoId}:`, error.message);
      return null;
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private normalizeTimestamp(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
}
