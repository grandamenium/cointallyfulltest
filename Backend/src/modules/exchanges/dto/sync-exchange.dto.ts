import { IsDateString, IsOptional } from 'class-validator';

export class SyncExchangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
