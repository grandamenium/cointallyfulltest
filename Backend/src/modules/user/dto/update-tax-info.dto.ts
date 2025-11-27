import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

enum FilingStatus {
  SINGLE = 'single',
  MARRIED_JOINT = 'married-joint',
  MARRIED_SEPARATE = 'married-separate',
  HEAD_OF_HOUSEHOLD = 'head-of-household',
}

enum IncomeBand {
  UNDER_50K = 'under-50k',
  BAND_50K_100K = '50k-100k',
  BAND_100K_200K = '100k-200k',
  BAND_200K_500K = '200k-500k',
  OVER_500K = 'over-500k',
}

export class UpdateTaxInfoDto {
  @IsNumber()
  filingYear: number;

  @IsString()
  state: string;

  @IsEnum(FilingStatus)
  filingStatus: string;

  @IsEnum(IncomeBand)
  incomeBand: string;

  @IsNumber()
  @IsOptional()
  priorYearLosses?: number;
}
