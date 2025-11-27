import { IsString, IsEnum, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

enum ConnectionType {
  WALLET_CONNECT = 'wallet-connect',
  API_KEY = 'api-key',
  CSV_UPLOAD = 'csv-upload',
}

class CredentialsDto {
  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  passphrase?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileSize?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class ConnectSourceDto {
  @IsString()
  sourceId: string;

  @IsEnum(ConnectionType)
  connectionType: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CredentialsDto)
  credentials: CredentialsDto;
}
