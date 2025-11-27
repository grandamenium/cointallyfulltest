import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  TRANSFER_IN = 'transfer-in',
  TRANSFER_OUT = 'transfer-out',
  SELF_TRANSFER = 'self-transfer',
  EXPENSE = 'expense',
  GIFT_RECEIVED = 'gift-received',
  GIFT_SENT = 'gift-sent',
  INCOME = 'income',
  MINING = 'mining',
  STAKING = 'staking',
  AIRDROP = 'airdrop',
}

enum Category {
  UNCATEGORIZED = 'uncategorized',
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

export class UpdateTransactionDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: string;

  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  valueUsd?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  fee?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  feeUsd?: number;

  @IsOptional()
  @IsString()
  fromAddress?: string;

  @IsOptional()
  @IsString()
  toAddress?: string;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsEnum(Category)
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
