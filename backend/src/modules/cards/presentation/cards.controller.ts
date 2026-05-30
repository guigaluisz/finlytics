import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class CardDto {
  @IsString() bank!: string;
  @IsString() brand!: string;
  @IsNumber() creditLimit!: number;
  @IsInt() @Min(1) @Max(31) closingDay!: number;
  @IsInt() @Min(1) @Max(31) dueDay!: number;
}

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.prisma.creditCard.findMany({ where: { userId, deletedAt: null } });
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CardDto) {
    return this.prisma.creditCard.create({ data: { ...dto, userId } });
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: Partial<CardDto>) {
    return this.prisma.creditCard.updateMany({ where: { id, userId }, data: dto });
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.prisma.creditCard.updateMany({ where: { id, userId }, data: { deletedAt: new Date() } });
  }

  // Fatura atual: soma despesas vinculadas ao cartão no ciclo corrente.
  @Get(':id/invoice')
  async invoice(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const card = await this.prisma.creditCard.findFirst({ where: { id, userId } });
    if (!card) return null;
    const agg = await this.prisma.transaction.aggregate({
      where: { userId, creditCardId: id, type: 'expense', deletedAt: null },
      _sum: { value: true },
    });
    const used = Number(agg._sum.value ?? 0);
    const limit = Number(card.creditLimit);
    return {
      used,
      available: limit - used,
      limit,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
    };
  }
}
