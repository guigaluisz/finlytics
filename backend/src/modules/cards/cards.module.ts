import { Module } from '@nestjs/common';
import { CardsController } from './presentation/cards.controller';
@Module({ controllers: [CardsController] })
export class CardsModule {}
