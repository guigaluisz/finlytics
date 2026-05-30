import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['receita', 'despesa'] }) @IsEnum(['receita', 'despesa']) tipo!: 'receita' | 'despesa';
  @ApiProperty() @IsNumber() @IsPositive() valor!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() categoriaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() cartaoId?: string;
  @ApiProperty() @IsDateString() data!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descricao?: string;
}

export class UpdateTransactionDto {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @IsPositive() valor?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() categoriaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() data?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descricao?: string;
}
