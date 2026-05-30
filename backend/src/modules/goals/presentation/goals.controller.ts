import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsPositive, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class GoalDto {
  @IsString() titulo!: string;
  @IsNumber() @IsPositive() valorAlvo!: number;
  @IsDateString() dataAlvo!: string;
}
class ContributionDto {
  @IsNumber() @IsPositive() valor!: number;
}

@ApiTags('metas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('metas')
export class GoalsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser('id') usuarioId: string) {
    const metas = await this.prisma.financialGoal.findMany({ where: { usuarioId } });
    return metas.map((m) => this.comProgresso(m));
  }

  @Post()
  create(@CurrentUser('id') usuarioId: string, @Body() dto: GoalDto) {
    return this.prisma.financialGoal.create({
      data: { usuarioId, titulo: dto.titulo, valorAlvo: dto.valorAlvo, dataAlvo: new Date(dto.dataAlvo) },
    });
  }

  @Post(':id/aportes')
  async aportar(@CurrentUser('id') usuarioId: string, @Param('id') id: string, @Body() dto: ContributionDto) {
    const meta = await this.prisma.financialGoal.findFirst({ where: { id, usuarioId } });
    if (!meta) return null;
    const atual = Number(meta.valorAtual) + dto.valor;
    const concluida = atual >= Number(meta.valorAlvo);
    await this.prisma.goalContribution.create({ data: { metaId: id, valor: dto.valor, data: new Date() } });
    return this.prisma.financialGoal.update({
      where: { id },
      data: { valorAtual: atual, status: concluida ? 'concluida' : 'ativa' },
    });
  }

  @Patch(':id')
  update(@CurrentUser('id') usuarioId: string, @Param('id') id: string, @Body() dto: Partial<GoalDto>) {
    const data: any = { ...dto };
    if (dto.dataAlvo) data.dataAlvo = new Date(dto.dataAlvo);
    return this.prisma.financialGoal.updateMany({ where: { id, usuarioId }, data });
  }

  @Delete(':id')
  remove(@CurrentUser('id') usuarioId: string, @Param('id') id: string) {
    return this.prisma.financialGoal.deleteMany({ where: { id, usuarioId } });
  }

  private comProgresso(m: any) {
    const alvo = Number(m.valorAlvo);
    const atual = Number(m.valorAtual);
    const meses = Math.max(1, Math.ceil((new Date(m.dataAlvo).getTime() - Date.now()) / (30 * 864e5)));
    return {
      ...m,
      progresso: alvo > 0 ? Math.min(100, Math.round((atual / alvo) * 100)) : 0,
      aporteMensalSugerido: Math.max(0, (alvo - atual) / meses),
    };
  }
}
