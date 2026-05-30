import { Controller, Get, Header } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

/** Serve o painel web estático em GET /v1/painel (mesma origem da API). */
@Controller('painel')
export class AdminController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  page(): string {
    try {
      return readFileSync(join(process.cwd(), 'public', 'admin.html'), 'utf-8');
    } catch {
      return '<h1>Painel indisponível</h1><p>Arquivo public/admin.html não encontrado.</p>';
    }
  }
}
