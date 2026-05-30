import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class UpdateMeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() locale?: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async me(@CurrentUser('id') id: string) {
    const u = await this.prisma.user.findUnique({ where: { id }, include: { subscription: true } });
    if (!u) return null;
    return { id: u.id, name: u.name, email: u.email, phone: u.phone, plan: u.subscription?.plan ?? 'free' };
  }

  @Patch()
  update(@CurrentUser('id') id: string, @Body() dto: UpdateMeDto) {
    return this.prisma.user.update({ where: { id }, data: dto, select: { id: true, name: true, phone: true } });
  }

  @Delete()
  async remove(@CurrentUser('id') id: string) {
    // LGPD: anonimiza e marca exclusão (carência antes de hard delete via job).
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), email: `deleted-${id}@finlytics.invalid`, name: 'Usuário removido', phone: null },
    });
    return { message: 'Conta marcada para exclusão.' };
  }
}
