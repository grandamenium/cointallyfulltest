import { IsString, IsEnum, IsOptional } from 'class-validator';

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

export class CategorizeTransactionDto {
  @IsEnum(Category)
  category: string;

  @IsOptional()
  @IsString()
  description?: string;
}
