import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TransactionsService } from '../application/transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dtos';

@ApiTags('transacoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transacoes')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Post()
  create(@CurrentUser('id') usuarioId: string, @Body() dto: CreateTransactionDto) {
    return this.service.create(usuarioId, dto);
  }

  @Get()
  list(
    @CurrentUser('id') usuarioId: string,
    @Query('tipo') tipo?: 'receita' | 'despesa',
    @Query('categoriaId') categoriaId?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
    @Query('busca') busca?: string,
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
  ) {
    return this.service.list(usuarioId, { tipo, categoriaId, de, ate, busca, pagina: Number(pagina), limite: Number(limite) });
  }

  @Get('resumo')
  resumo(@CurrentUser('id') usuarioId: string, @Query('de') de: string, @Query('ate') ate: string) {
    return this.service.summary(usuarioId, de, ate);
  }

  @Get(':id')
  findOne(@CurrentUser('id') usuarioId: string, @Param('id') id: string) {
    return this.service.findOne(usuarioId, id);
  }

  @Patch(':id')
  update(@CurrentUser('id') usuarioId: string, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.service.update(usuarioId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') usuarioId: string, @Param('id') id: string) {
    return this.service.remove(usuarioId, id);
  }
}
