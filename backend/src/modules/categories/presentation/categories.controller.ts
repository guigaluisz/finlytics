import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class CategoryDto {
  @IsString() name!: string;
  @IsEnum(['income', 'expense', 'both']) type!: 'income' | 'expense' | 'both';
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() icon?: string;
}

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.prisma.category.findMany({ where: { userId, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CategoryDto) {
    return this.prisma.category.create({ data: { ...dto, userId } });
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: Partial<CategoryDto>) {
    return this.prisma.category.updateMany({ where: { id, userId }, data: dto });
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.prisma.category.updateMany({ where: { id, userId }, data: { deletedAt: new Date() } });
  }
}
