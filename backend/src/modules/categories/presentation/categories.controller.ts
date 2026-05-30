import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class CategoryDto {
  @IsString() nome!: string;
  @IsEnum(['receita', 'despesa', 'ambos']) tipo!: 'receita' | 'despesa' | 'ambos';
  @IsOptional() @IsString() cor?: string;
  @IsOptional() @IsString() icone?: string;
}

@ApiTags('categorias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser('id') usuarioId: string) {
    return this.prisma.category.findMany({ where: { usuarioId, excluidoEm: null }, orderBy: { nome: 'asc' } });
  }

  @Post()
  create(@CurrentUser('id') usuarioId: string, @Body() dto: CategoryDto) {
    return this.prisma.category.create({ data: { ...dto, usuarioId } });
  }

  @Patch(':id')
  update(@CurrentUser('id') usuarioId: string, @Param('id') id: string, @Body() dto: Partial<CategoryDto>) {
    return this.prisma.category.updateMany({ where: { id, usuarioId }, data: dto });
  }

  @Delete(':id')
  remove(@CurrentUser('id') usuarioId: string, @Param('id') id: string) {
    return this.prisma.category.updateMany({ where: { id, usuarioId }, data: { excluidoEm: new Date() } });
  }
}
