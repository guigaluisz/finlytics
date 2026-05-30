import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['income', 'expense'] }) @IsEnum(['income', 'expense']) type!: 'income' | 'expense';
  @ApiProperty() @IsNumber() @IsPositive() value!: number;
  @ApiProperty() @IsOptional() @IsUUID() categoryId?: string;
  @ApiProperty() @IsOptional() @IsUUID() creditCardId?: string;
  @ApiProperty() @IsDateString() date!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}

export class UpdateTransactionDto {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @IsPositive() value?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() categoryId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
