import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsString() @MinLength(2) nome!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() sobrenome?: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telefone?: string;
  @ApiProperty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Senha deve ter ao menos 1 maiúscula, 1 número e 1 símbolo',
  })
  senha!: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() senha!: string;
}

export class RefreshDto {
  @ApiProperty() @IsString() tokenAtualizacao!: string;
}

export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() email!: string;
}

export class ResetPasswordDto {
  @ApiProperty() @IsString() token!: string;
  @ApiProperty() @MinLength(8) senha!: string;
}
