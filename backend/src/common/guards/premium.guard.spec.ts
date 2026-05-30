import { PremiumGuard } from './premium.guard';
import { ForbiddenException } from '@nestjs/common';

function ctxWith(user: any) {
  return { switchToHttp: () => ({ getRequest: () => ({ user }) }) } as any;
}

describe('PremiumGuard', () => {
  const guard = new PremiumGuard();

  it('bloqueia usuário free', () => {
    expect(() => guard.canActivate(ctxWith({ plan: 'free' }))).toThrow(ForbiddenException);
  });

  it('permite usuário premium', () => {
    expect(guard.canActivate(ctxWith({ plan: 'premium_annual' }))).toBe(true);
  });

  it('bloqueia quando não há usuário', () => {
    expect(() => guard.canActivate(ctxWith(undefined))).toThrow(ForbiddenException);
  });
});
