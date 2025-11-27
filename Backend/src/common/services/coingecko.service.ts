import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly httpClient: AxiosInstance;
  private lastCallTime = 0;
  private readonly MIN_INTERVAL = 10000;

  private readonly ASSET_TO_COINGECKO_ID: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDC: 'usd-coin',
    USDT: 'tether',
    BNB: 'binancecoin',
    SOL: 'solana',
    ADA: 'cardano',
    DOT: 'polkadot',
    DOGE: 'dogecoin',
    MATIC: 'matic-network',
    AVAX: 'avalanche-2',
    LINK: 'chainlink',
    UNI: 'uniswap',
    LTC: 'litecoin',
    BCH: 'bitcoin-cash',
    ATOM: 'cosmos',
    ETC: 'ethereum-classic',
    XLM: 'stellar',
    ALGO: 'algorand',
    VET: 'vechain',
    FIL: 'filecoin',
    TRX: 'tron',
    DAI: 'dai',
    SHIB: 'shiba-inu',
    ARB: 'arbitrum',
    OP: 'optimism',
    GRT: 'the-graph',
    SNX: 'havven',
    TIA: 'celestia',
    JUP: 'jupiter-exchange-solana',
    SUI: 'sui',
    BIGTIME: 'big-time',
  };

  constructor(private configService: ConfigService) {
    this.httpClient = axios.create({
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 10000,
    });
  }

  async getHistoricalPrice(asset: string, date: Date, retryCount: number = 0): Promise<number | null> {
    const coinId = this.ASSET_TO_COINGECKO_ID[asset.toUpperCase()];

    if (!coinId) {
      this.logger.warn(`No CoinGecko ID mapping for asset: ${asset}`);
      return null;
    }

    await this.respectRateLimit();

    try {
      const dateStr = this.formatDate(date);

      const response = await this.httpClient.get(
        `/coins/${coinId}/history`,
        {
          params: {
            date: dateStr,
            localization: false,
          },
        },
      );

      const price = response.data?.market_data?.current_price?.usd;

      if (!price) {
        this.logger.warn(`No price data for ${asset} on ${dateStr}`);
        return null;
      }

      this.logger.log(`Fetched price for ${asset} on ${dateStr}: $${price}`);
      return price;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          if (retryCount < 3) {
            const waitTime = 60000;
            this.logger.warn(`Rate limit hit. Waiting ${waitTime/1000}s before retry ${retryCount + 1}/3`);
            await this.sleep(waitTime);
            return this.getHistoricalPrice(asset, date, retryCount + 1);
          } else {
            this.logger.error('CoinGecko rate limit exceeded after 3 retries');
            return null;
          }
        }
        this.logger.error(`CoinGecko API error: ${error.message}`);
      } else {
        this.logger.error(`Error fetching price: ${error}`);
      }
      return null;
    }
  }

  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;

    if (elapsed < this.MIN_INTERVAL) {
      const waitTime = this.MIN_INTERVAL - elapsed;
      this.logger.debug(`Rate limit: waiting ${waitTime}ms`);
      await this.sleep(waitTime);
    }

    this.lastCallTime = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getCoinGeckoId(asset: string): string | undefined {
    return this.ASSET_TO_COINGECKO_ID[asset.toUpperCase()];
  }
}
