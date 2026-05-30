import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../infra/database/prisma.service';

const MUTACOES = ['POST', 'PATCH', 'PUT', 'DELETE'];

/** Registra ações de escrita em logs_auditoria (LGPD). Não bloqueia a resposta. */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, params, user, ip } = req;

    return next.handle().pipe(
      tap(() => {
        if (!MUTACOES.includes(method)) return;
        this.prisma.auditLog
          .create({
            data: {
              usuarioId: user?.id ?? null,
              acao: `${method} ${this.rota(originalUrl)}`,
              entidade: this.entidade(originalUrl),
              entidadeId: params?.id ?? null,
              ip: ip ?? null,
            },
          })
          .catch(() => undefined);
      }),
    );
  }

  private rota(url: string) {
    return (url || '').split('?')[0];
  }

  private entidade(url: string) {
    const partes = this.rota(url).split('/').filter(Boolean); // ['v1','transacoes','id']
    return partes[1] ?? null;
  }
}
