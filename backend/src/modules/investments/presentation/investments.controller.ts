import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PremiumGuard } from '../../../common/guards/premium.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

const ASSET_TYPES = ['cdb', 'lci', 'lca', 'tesouro', 'fii', 'stock', 'etf', 'intl'];

class InvestmentDto {
  @IsEnum(ASSET_TYPES) assetType!: string;
  @IsString() ticker!: string;
  @IsNumber() @IsPositive() quantity!: number;
  @IsNumber() @IsPositive() averagePrice!: number;
}

@ApiTags('investments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser('id') userId: string) {
    const items = await this.prisma.investment.findMany({ where: { userId } });
    return items.map((i) => this.withReturns(i));
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: InvestmentDto) {
    return this.prisma.investment.create({ data: { ...dto, userId } as any });
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: Partial<InvestmentDto>) {
    return this.prisma.investment.updateMany({ where: { id, userId }, data: dto as any });
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.prisma.investment.deleteMany({ where: { id, userId } });
  }

  private withReturns(i: any) {
    const qty = Number(i.quantity);
    const avg = Number(i.averagePrice);
    const cur = Number(i.currentPrice ?? i.averagePrice);
    const invested = qty * avg;
    const marketValue = qty * cur;
    const profit = marketValue - invested;
    return {
      ...i,
      invested,
      marketValue,
      profit,
      profitability: invested > 0 ? (profit / invested) * 100 : 0,
    };
  }
}
