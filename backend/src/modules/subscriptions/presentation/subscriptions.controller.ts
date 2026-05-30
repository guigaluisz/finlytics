import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class VerifyDto {
  @IsString() provider!: string; // apple | google
  @IsString() receipt!: string;
  @IsString() plan!: string; // premium_monthly | premium_annual
}

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  // Em produção: validar recibo junto à App Store/Play antes de ativar.
  @Post('verify')
  async verify(@CurrentUser('id') userId: string, @Body() dto: VerifyDto) {
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + (dto.plan === 'premium_annual' ? 12 : 1));
    return this.prisma.subscription.update({
      where: { userId },
      data: { plan: dto.plan as any, status: 'active', provider: dto.provider, expirationDate: expiration },
    });
  }

  @Post('cancel')
  cancel(@CurrentUser('id') userId: string) {
    return this.prisma.subscription.update({ where: { userId }, data: { status: 'canceled' } });
  }
}
