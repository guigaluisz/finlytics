import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class VerifyDto {
  @IsString() provedor!: string; // apple | google
  @IsString() recibo!: string;
  @IsString() plano!: string; // premium_mensal | premium_anual
}

@ApiTags('assinaturas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assinaturas')
export class SubscriptionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('minha')
  minha(@CurrentUser('id') usuarioId: string) {
    return this.prisma.subscription.findUnique({ where: { usuarioId } });
  }

  @Post('verificar')
  async verificar(@CurrentUser('id') usuarioId: string, @Body() dto: VerifyDto) {
    const dataExpiracao = new Date();
    dataExpiracao.setMonth(dataExpiracao.getMonth() + (dto.plano === 'premium_anual' ? 12 : 1));
    return this.prisma.subscription.update({
      where: { usuarioId },
      data: { plano: dto.plano as any, status: 'ativa', provedor: dto.provedor, dataExpiracao },
    });
  }

  @Post('cancelar')
  cancelar(@CurrentUser('id') usuarioId: string) {
    return this.prisma.subscription.update({ where: { usuarioId }, data: { status: 'cancelada' } });
  }
}
