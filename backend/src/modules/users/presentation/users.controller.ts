import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class UpdateMeDto {
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() idioma?: string;
}

class OnboardingDto {
  @IsOptional() @IsString() objetivo?: string;
  @IsOptional() @IsString() faixaRenda?: string;
  @IsOptional() @IsString() perfilRisco?: string;
}

@ApiTags('usuario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('eu')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async eu(@CurrentUser('id') id: string) {
    const u = await this.prisma.user.findUnique({ where: { id }, include: { assinatura: true } });
    if (!u) return null;
    return {
      id: u.id, nome: u.nome, email: u.email, telefone: u.telefone,
      objetivo: u.objetivo, faixaRenda: u.faixaRenda, perfilRisco: u.perfilRisco,
      plano: u.assinatura?.plano ?? 'gratuito',
    };
  }

  @Patch()
  atualizar(@CurrentUser('id') id: string, @Body() dto: UpdateMeDto) {
    return this.prisma.user.update({ where: { id }, data: dto, select: { id: true, nome: true, telefone: true } });
  }

  // Persiste as respostas do onboarding (objetivo, faixa de renda, perfil de risco).
  @Patch('onboarding')
  async onboarding(@CurrentUser('id') id: string, @Body() dto: OnboardingDto) {
    await this.prisma.user.update({
      where: { id },
      data: { objetivo: dto.objetivo, faixaRenda: dto.faixaRenda, perfilRisco: dto.perfilRisco },
    });
    return { mensagem: 'Perfil salvo com sucesso.' };
  }

  @Get('logs-auditoria')
  logsAuditoria(@CurrentUser('id') id: string) {
    return this.prisma.auditLog.findMany({ where: { usuarioId: id }, orderBy: { criadoEm: 'desc' }, take: 100 });
  }

  @Delete()
  async excluir(@CurrentUser('id') id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { excluidoEm: new Date(), email: `excluido-${id}@finlytics.invalid`, nome: 'Usuário removido', telefone: null },
    });
    return { mensagem: 'Conta marcada para exclusão.' };
  }
}
