import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PremiumGuard } from '../../../common/guards/premium.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

const TIPOS_ATIVO = ['cdb', 'lci', 'lca', 'tesouro', 'fii', 'acao', 'etf', 'internacional'];

class InvestmentDto {
  @IsEnum(TIPOS_ATIVO) tipoAtivo!: string;
  @IsString() ticker!: string;
  @IsNumber() @IsPositive() quantidade!: number;
  @IsNumber() @IsPositive() precoMedio!: number;
}

@ApiTags('investimentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('investimentos')
export class InvestmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser('id') usuarioId: string) {
    const itens = await this.prisma.investment.findMany({ where: { usuarioId } });
    return itens.map((i) => this.comRetorno(i));
  }

  @Post()
  create(@CurrentUser('id') usuarioId: string, @Body() dto: InvestmentDto) {
    return this.prisma.investment.create({ data: { ...dto, usuarioId } as any });
  }

  @Patch(':id')
  update(@CurrentUser('id') usuarioId: string, @Param('id') id: string, @Body() dto: Partial<InvestmentDto>) {
    return this.prisma.investment.updateMany({ where: { id, usuarioId }, data: dto as any });
  }

  @Delete(':id')
  remove(@CurrentUser('id') usuarioId: string, @Param('id') id: string) {
    return this.prisma.investment.deleteMany({ where: { id, usuarioId } });
  }

  private comRetorno(i: any) {
    const qtd = Number(i.quantidade);
    const medio = Number(i.precoMedio);
    const atual = Number(i.precoAtual ?? i.precoMedio);
    const investido = qtd * medio;
    const valorMercado = qtd * atual;
    const lucro = valorMercado - investido;
    return {
      ...i,
      investido,
      valorMercado,
      lucro,
      rentabilidade: investido > 0 ? (lucro / investido) * 100 : 0,
    };
  }
}
