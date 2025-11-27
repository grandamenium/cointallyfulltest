import { Module } from '@nestjs/common';
import { ExchangesController } from './exchanges.controller';
import { ExchangesTesterController } from './exchanges-tester.controller';
import { ExchangeSyncService } from './services/exchange-sync.service';
import { CoinbaseAdapter } from './adapters/coinbase.adapter';
import { BinanceAdapter } from './adapters/binance.adapter';
import { KrakenAdapter } from './adapters/kraken.adapter';
import { BybitAdapter } from './adapters/bybit.adapter';
import { OkxAdapter } from './adapters/okx.adapter';
import { KucoinAdapter } from './adapters/kucoin.adapter';
import { GateioAdapter } from './adapters/gateio.adapter';
import { MexcAdapter } from './adapters/mexc.adapter';
import { PrismaService } from '../../common/services/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  controllers: [ExchangesController, ExchangesTesterController],
  providers: [
    ExchangeSyncService,
    CoinbaseAdapter,
    BinanceAdapter,
    KrakenAdapter,
    BybitAdapter,
    OkxAdapter,
    KucoinAdapter,
    GateioAdapter,
    MexcAdapter,
    PrismaService,
    EncryptionService,
  ],
  exports: [ExchangeSyncService],
})
export class ExchangesModule {}
