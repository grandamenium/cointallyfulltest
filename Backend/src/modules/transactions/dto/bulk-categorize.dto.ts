import { IsArray, IsString, IsEnum, IsOptional, ValidateIf, IsBoolean } from 'class-validator';

enum Category {
  PERSONAL = 'personal',
  BUSINESS_EXPENSE = 'business-expense',
  SELF_TRANSFER = 'self-transfer',
  GIFT = 'gift',
  INCOME = 'income',
  DONATION = 'donation',
  MINING = 'mining',
  STAKING = 'staking',
  AIRDROP = 'airdrop',
  LOST = 'lost',
}

export class BulkCategorizeDto {
  @ValidateIf(o => !o.transactionIds && !o.categorizeAllUncategorized)
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @ValidateIf(o => !o.ids && !o.categorizeAllUncategorized)
  @IsArray()
  @IsString({ each: true })
  transactionIds?: string[];

  @IsOptional()
  @IsBoolean()
  categorizeAllUncategorized?: boolean;

  @IsEnum(Category)
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  getTransactionIds(): string[] {
    return this.ids || this.transactionIds || [];
  }
}
