import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { LoginDto, RefreshDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dtos';

@ApiTags('autenticacao')
@Controller('autenticacao')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('registrar')
  registrar(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('atualizar')
  @HttpCode(200)
  atualizar(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.tokenAtualizacao);
  }

  @Post('sair')
  @HttpCode(204)
  async sair(@Body() dto: RefreshDto) {
    await this.auth.logout(dto.tokenAtualizacao);
  }

  @Post('esqueci-senha')
  @HttpCode(200)
  esqueciSenha(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('redefinir-senha')
  @HttpCode(200)
  redefinirSenha(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.senha);
  }
}
