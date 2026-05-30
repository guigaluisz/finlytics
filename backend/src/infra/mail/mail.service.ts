import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private readonly transporter: nodemailer.Transporter;
  private readonly from = process.env.MAIL_FROM ?? 'Finlytics <no-reply@finlytics.app>';

  constructor() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
    } else {
      // Dev: não envia de verdade; serializa a mensagem para o log.
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  async sendPasswordReset(to: string, resetLink: string, token: string) {
    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Recuperação de senha — Finlytics',
      text: `Você solicitou a redefinição de senha.\nLink: ${resetLink}\nToken: ${token}\nExpira em 30 minutos.`,
      html: `<p>Você solicitou a redefinição de senha.</p>
             <p><a href="${resetLink}">Redefinir senha</a></p>
             <p>Ou use o token: <code>${token}</code> (expira em 30 min).</p>`,
    });
    if (!process.env.SMTP_HOST) {
      // Em dev, mostra o token no log para você testar o reset.
      this.logger.warn(`[DEV] E-mail de reset para ${to} -> token: ${token}`);
    }
    return info;
  }
}
