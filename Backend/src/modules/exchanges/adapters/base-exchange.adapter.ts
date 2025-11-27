import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export abstract class BaseExchangeAdapter {
  protected readonly logger = new Logger(this.constructor.name);
  protected client: AxiosInstance;

  protected maxRetries = 3;
  protected retryDelay = 1000;

  constructor() {
    this.client = axios.create();
  }

  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        this.logger.warn(`Request failed, retrying... (${retries} attempts left)`);
        await this.sleep(this.retryDelay);
        return this.executeWithRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  protected isRetryableError(error: any): boolean {
    const status = error?.response?.status;
    return status === 429 || status === 503 || status === 504 || !status;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected handleApiError(error: any, context: string): never {
    this.logger.error(`${context} error:`, error?.response?.data || error.message);

    const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error?.response?.data?.message || error.message || 'Unknown error';

    throw new HttpException(
      {
        statusCode: status,
        message: `${context}: ${message}`,
        error: error?.response?.data,
      },
      status,
    );
  }

  protected buildAuthHeaders(apiKey: string, signature: string, timestamp: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }
}
