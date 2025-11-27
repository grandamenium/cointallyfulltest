import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { FormsModule } from './modules/forms/forms.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CsvImportModule } from './modules/csv-import/csv-import.module';
import { AuditModule } from './modules/audit/audit.module';
import { PrismaService } from './common/services/prisma.service';
import { EncryptionService } from './common/services/encryption.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend-test'),
      serveRoot: '/demo',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    AuthModule,
    UserModule,
    WalletsModule,
    ExchangesModule,
    TransactionsModule,
    FormsModule,
    PricingModule,
    JobsModule,
    CsvImportModule,
    AuditModule,
  ],
  providers: [PrismaService, EncryptionService],
  exports: [PrismaService, EncryptionService],
})
export class AppModule {}
