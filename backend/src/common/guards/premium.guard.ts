import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class PremiumGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    if (!user || user.plano === 'gratuito') {
      throw new ForbiddenException('Recurso disponível apenas no plano Premium');
    }
    return true;
  }
}
