import { Module } from '@nestjs/common';
import { NetWorthController } from './presentation/networth.controller';
@Module({ controllers: [NetWorthController] })
export class NetWorthModule {}
