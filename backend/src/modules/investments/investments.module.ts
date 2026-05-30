import { Module } from '@nestjs/common';
import { InvestmentsController } from './presentation/investments.controller';
@Module({ controllers: [InvestmentsController] })
export class InvestmentsModule {}
