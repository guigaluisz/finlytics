import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './infra/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CardsModule } from './modules/cards/cards.module';
import { GoalsModule } from './modules/goals/goals.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { QueueModule } from './infra/queue/queue.module';
import { MailModule } from './infra/mail/mail.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { NetWorthModule } from './modules/networth/networth.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HealthController } from './common/health.controller';
import { AdminController } from './common/admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([
      { ttl: Number(process.env.THROTTLE_TTL ?? 60) * 1000, limit: Number(process.env.THROTTLE_LIMIT ?? 100) },
    ]),
    PrismaModule,
    QueueModule,
    MailModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    CategoriesModule,
    CardsModule,
    GoalsModule,
    InvestmentsModule,
    ReportsModule,
    SubscriptionsModule,
    JobsModule,
    AlertsModule,
    NetWorthModule,
  ],
  controllers: [HealthController, AdminController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
