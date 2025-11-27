import { IsNumber, IsEnum, IsArray, IsString, IsOptional } from 'class-validator';

enum TaxMethod {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
  HIFO = 'HIFO',
  SPECIFIC_ID = 'SpecificID',
}

export class GenerateFormDto {
  @IsNumber()
  taxYear: number;

  @IsEnum(TaxMethod)
  taxMethod: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeTransactionIds?: string[];
}
