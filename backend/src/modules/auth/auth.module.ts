import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/auth.service';
import { PasswordService } from './infra/password.service';
import { JwtStrategy } from './infra/jwt.strategy';
import { PrismaAuthRepository } from './infra/prisma-auth.repository';
import { AUTH_REPOSITORY } from './domain/auth.repository';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    JwtStrategy,
    { provide: AUTH_REPOSITORY, useClass: PrismaAuthRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
