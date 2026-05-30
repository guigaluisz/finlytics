import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../infra/database/prisma.service';

const MUTATIONS = ['POST', 'PATCH', 'PUT', 'DELETE'];

/**
 * Registra ações sensíveis (escritas) em audit_logs — requisito de LGPD/segurança.
 * Não bloqueia a resposta: a gravação é "fire and forget".
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, params, user, ip } = req;

    return next.handle().pipe(
      tap(() => {
        if (!MUTATIONS.includes(method)) return;
        // não auditar login/registro com corpo sensível; registra só a ação
        this.prisma.auditLog
          .create({
            data: {
              userId: user?.id ?? null,
              action: `${method} ${this.routePath(originalUrl)}`,
              entity: this.entityFrom(originalUrl),
              entityId: params?.id ?? null,
              ip: ip ?? null,
            },
          })
          .catch(() => undefined);
      }),
    );
  }

  private routePath(url: string) {
    return (url || '').split('?')[0];
  }

  private entityFrom(url: string) {
    const parts = this.routePath(url).split('/').filter(Boolean); // ['v1','transactions','id']
    return parts[1] ?? null;
  }
}
