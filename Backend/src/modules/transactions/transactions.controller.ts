import { Controller, Get, Patch, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { BulkCategorizeDto } from './dto/bulk-categorize.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CapitalGainsService } from '../forms/services/capital-gains.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private prisma: PrismaService,
    private capitalGainsService: CapitalGainsService,
  ) {}

  @Get()
  async getTransactions(@CurrentUser() user: any, @Query() query: QueryTransactionsDto) {
    const where: any = { userId: user.id };

    if (query.sourceId) {
      where.sourceId = query.sourceId;
    }

    if (query.category) {
      if (query.category === 'uncategorized') {
        where.isCategorized = false;
      } else {
        where.category = query.category;
      }
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    const limit = query.limit || 50;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  @Get('summary')
  async getTransactionSummary(
    @CurrentUser() user: any,
    @Query('year') year?: string,
    @Query('method') method?: string,
  ) {
    const taxYear = year ? parseInt(year) : new Date().getFullYear();
    const taxMethod = method || 'FIFO';

    const startDate = new Date(`${taxYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${taxYear}-12-31T23:59:59.999Z`);

    const [result, transactionCount] = await Promise.all([
      this.capitalGainsService.calculate(user.id, taxYear, taxMethod),
      this.prisma.transaction.count({
        where: {
          userId: user.id,
          date: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const totalGains = parseFloat(result.totalGains.toString());
    const totalLosses = parseFloat(result.totalLosses.toString());
    const netGainLoss = parseFloat(result.netGainLoss.toString());
    const shortTermGains = parseFloat(result.shortTermGains.toString());
    const shortTermLosses = parseFloat(result.shortTermLosses.toString());
    const longTermGains = parseFloat(result.longTermGains.toString());
    const longTermLosses = parseFloat(result.longTermLosses.toString());

    const estimatedTax = Math.max(0, netGainLoss * 0.25);

    return {
      totalGains: Math.round(totalGains * 100) / 100,
      totalLosses: Math.round(totalLosses * 100) / 100,
      netGainLoss: Math.round(netGainLoss * 100) / 100,
      estimatedTax: Math.round(estimatedTax * 100) / 100,
      shortTermGains: Math.round(shortTermGains * 100) / 100,
      shortTermLosses: Math.round(shortTermLosses * 100) / 100,
      longTermGains: Math.round(longTermGains * 100) / 100,
      longTermLosses: Math.round(longTermLosses * 100) / 100,
      transactionCount,
      taxableEventsCount: result.transactionsIncluded,
      taxYear,
    };
  }

  @Get('stats')
  async getTransactionStats(@CurrentUser() user: any) {
    const [total, categorized] = await Promise.all([
      this.prisma.transaction.count({ where: { userId: user.id } }),
      this.prisma.transaction.count({ where: { userId: user.id, isCategorized: true } }),
    ]);

    return {
      totalCount: total,
      categorizedCount: categorized,
      uncategorizedCount: total - categorized,
      categorizationRate: total > 0 ? Math.round((categorized / total) * 100) : 0,
    };
  }

  @Get('pnl-history')
  async getPnLHistory(
    @CurrentUser() user: any,
    @Query('year') year?: string,
    @Query('method') method?: string,
  ) {
    const taxYear = year ? parseInt(year) : new Date().getFullYear();
    const taxMethod = method || 'FIFO';

    const result = await this.capitalGainsService.calculate(user.id, taxYear, taxMethod);

    const pnlByDate = new Map<string, number>();

    for (const item of result.items) {
      const dateKey = item.dateSold.toISOString().split('T')[0];
      const gainLoss = parseFloat(item.gainOrLoss.toString());
      pnlByDate.set(dateKey, (pnlByDate.get(dateKey) || 0) + gainLoss);
    }

    const sortedDates = Array.from(pnlByDate.keys()).sort();

    let cumulativePnl = 0;
    const dataPoints = sortedDates.map((date) => {
      const pnl = pnlByDate.get(date) || 0;
      cumulativePnl += pnl;
      return {
        date,
        pnl: Math.round(pnl * 100) / 100,
        cumulativePnl: Math.round(cumulativePnl * 100) / 100,
      };
    });

    return {
      dataPoints,
      totalPnl: Math.round(cumulativePnl * 100) / 100,
      startDate: sortedDates[0] || null,
      endDate: sortedDates[sortedDates.length - 1] || null,
      taxYear,
      method: taxMethod,
    };
  }

  @Get(':id')
  async getTransaction(@CurrentUser() user: any, @Param('id') id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!transaction) {
      return { error: 'Transaction not found', code: 'NOT_FOUND' };
    }

    return { transaction };
  }

  @Patch(':id')
  async updateTransaction(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!transaction) {
      return { error: 'Transaction not found', code: 'NOT_FOUND' };
    }

    const updateData: any = {};

    if (dto.date !== undefined) updateData.date = new Date(dto.date);
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.asset !== undefined) updateData.asset = dto.asset;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.valueUsd !== undefined) updateData.valueUsd = dto.valueUsd;
    if (dto.fee !== undefined) updateData.fee = dto.fee;
    if (dto.feeUsd !== undefined) updateData.feeUsd = dto.feeUsd;
    if (dto.fromAddress !== undefined) updateData.fromAddress = dto.fromAddress;
    if (dto.toAddress !== undefined) updateData.toAddress = dto.toAddress;
    if (dto.txHash !== undefined) updateData.txHash = dto.txHash;
    if (dto.category !== undefined) {
      updateData.category = dto.category;
      updateData.isCategorized = dto.category !== 'uncategorized';
    }
    if (dto.description !== undefined) updateData.description = dto.description;

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      data: updated,
    };
  }

  @Post('bulk-categorize')
  async bulkCategorize(@CurrentUser() user: any, @Body() dto: BulkCategorizeDto) {
    let whereClause: any = { userId: user.id };

    if (dto.categorizeAllUncategorized) {
      whereClause.isCategorized = false;
    } else {
      const transactionIds = dto.getTransactionIds();

      if (transactionIds.length === 0) {
        return { error: 'No transaction IDs provided', code: 'BAD_REQUEST' };
      }

      const count = await this.prisma.transaction.count({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      if (count !== transactionIds.length) {
        return { error: 'Some transactions not found', code: 'NOT_FOUND' };
      }

      whereClause.id = { in: transactionIds };
    }

    const result = await this.prisma.transaction.updateMany({
      where: whereClause,
      data: {
        category: dto.category,
        description: dto.description,
        isCategorized: true,
      },
    });

    return {
      success: true,
      updatedCount: result.count,
    };
  }
}
