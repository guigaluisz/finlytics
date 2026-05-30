import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

@ApiTags('alertas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alertas')
export class AlertsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser('id') usuarioId: string) {
    return this.prisma.alert.findMany({ where: { usuarioId }, orderBy: { criadoEm: 'desc' } });
  }

  @Patch(':id/ler')
  ler(@CurrentUser('id') usuarioId: string, @Param('id') id: string) {
    return this.prisma.alert.updateMany({ where: { id, usuarioId }, data: { lida: true } });
  }

  @Post('ler-todos')
  lerTodos(@CurrentUser('id') usuarioId: string) {
    return this.prisma.alert.updateMany({ where: { usuarioId, lida: false }, data: { lida: true } });
  }
}
