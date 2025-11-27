import { IsString, IsOptional, IsObject } from 'class-validator';

export class ConnectExchangeDto {
  @IsString()
  exchangeName: string;

  @IsString()
  apiKey: string;

  @IsString()
  apiSecret: string;

  @IsOptional()
  @IsString()
  passphrase?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsObject()
  additionalConfig?: Record<string, any>;
}
