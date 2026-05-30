import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class CardDto {
  @IsString() banco!: string;
  @IsString() bandeira!: string;
  @IsNumber() limite!: number;
  @IsInt() @Min(1) @Max(31) diaFechamento!: number;
  @IsInt() @Min(1) @Max(31) diaVencimento!: number;
}

@ApiTags('cartoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cartoes')
export class CardsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser('id') usuarioId: string) {
    return this.prisma.creditCard.findMany({ where: { usuarioId, excluidoEm: null } });
  }

  @Post()
  create(@CurrentUser('id') usuarioId: string, @Body() dto: CardDto) {
    return this.prisma.creditCard.create({ data: { ...dto, usuarioId } });
  }

  @Patch(':id')
  update(@CurrentUser('id') usuarioId: string, @Param('id') id: string, @Body() dto: Partial<CardDto>) {
    return this.prisma.creditCard.updateMany({ where: { id, usuarioId }, data: dto });
  }

  @Delete(':id')
  remove(@CurrentUser('id') usuarioId: string, @Param('id') id: string) {
    return this.prisma.creditCard.updateMany({ where: { id, usuarioId }, data: { excluidoEm: new Date() } });
  }

  @Get(':id/fatura')
  async fatura(@CurrentUser('id') usuarioId: string, @Param('id') id: string) {
    const cartao = await this.prisma.creditCard.findFirst({ where: { id, usuarioId } });
    if (!cartao) return null;
    const agg = await this.prisma.transaction.aggregate({
      where: { usuarioId, cartaoId: id, tipo: 'despesa', excluidoEm: null },
      _sum: { valor: true },
    });
    const usado = Number(agg._sum.valor ?? 0);
    const limite = Number(cartao.limite);
    return {
      usado,
      disponivel: limite - usado,
      limite,
      diaFechamento: cartao.diaFechamento,
      diaVencimento: cartao.diaVencimento,
    };
  }
}
