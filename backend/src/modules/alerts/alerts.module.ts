import { Module } from '@nestjs/common';
import { AlertsController } from './presentation/alerts.controller';
@Module({ controllers: [AlertsController] })
export class AlertsModule {}
