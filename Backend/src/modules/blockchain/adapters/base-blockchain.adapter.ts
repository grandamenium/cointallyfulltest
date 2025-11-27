import { Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ChainConfig } from '../config/chain-config';

export abstract class BaseBlockchainAdapter {
  protected readonly logger = new Logger(this.constructor.name);
  protected client: AxiosInstance;
  protected chainConfig: ChainConfig;
  protected apiKey: string;

  protected maxRetries = 5;
  protected baseRetryDelay = 1000;
  protected requestDelay = 220;
  protected lastRequestTime = 0;

  constructor(chainConfig: ChainConfig, apiKey: string) {
    this.chainConfig = chainConfig;
    this.apiKey = apiKey;
    this.client = axios.create({
      timeout: 30000,
    });
  }

  protected async throttledRequest<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.requestDelay) {
      await this.sleep(this.requestDelay - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
    return this.executeWithRetry(fn);
  }

  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries,
    attempt: number = 1,
  ): Promise<T> {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        const delay = this.baseRetryDelay * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Request failed, retrying in ${delay}ms... (${retries} attempts left)`,
        );
        await this.sleep(delay);
        return this.executeWithRetry(fn, retries - 1, attempt + 1);
      }
      throw error;
    }
  }

  protected isRetryableError(error: any): boolean {
    const status = error?.response?.status;
    if (status === 429 || status === 503 || status === 504 || !status) {
      return true;
    }

    const result = error?.response?.data?.result;
    if (typeof result === 'string') {
      const lowerResult = result.toLowerCase();
      if (
        lowerResult.includes('rate limit') ||
        lowerResult.includes('max rate')
      ) {
        return true;
      }
    }

    return false;
  }

  protected isRateLimitResponse(data: any): boolean {
    if (data?.status === '0' && data?.result) {
      const result =
        typeof data.result === 'string' ? data.result.toLowerCase() : '';
      return (
        result.includes('rate limit') ||
        result.includes('max rate') ||
        result.includes('max calls')
      );
    }
    return false;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected handleApiError(error: any, context: string): never {
    this.logger.error(
      `${context} error:`,
      error?.response?.data || error.message,
    );
    throw new Error(`${context}: ${error?.message || 'Unknown error'}`);
  }
}
