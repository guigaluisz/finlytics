import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Report } from './reports.service';

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

@Injectable()
export class ReportExportService {
  /** Gera planilha Excel do relatório. */
  async toExcel(report: Report): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Finlytics';
    const ws = wb.addWorksheet('Relatório');

    ws.mergeCells('A1:C1');
    ws.getCell('A1').value = `Finlytics — Relatório ${report.period.label}`;
    ws.getCell('A1').font = { bold: true, size: 14 };
    ws.addRow([]);
    ws.addRow(['Período', `${report.period.from} a ${report.period.to}`]);
    ws.addRow(['Receitas', brl(report.totals.income)]);
    ws.addRow(['Despesas', brl(report.totals.expense)]);
    ws.addRow(['Saldo', brl(report.totals.balance)]);
    ws.addRow([]);

    const header = ws.addRow(['Categoria', 'Tipo', 'Total']);
    header.font = { bold: true };
    for (const l of report.lines) {
      ws.addRow([l.categoryName, l.type === 'income' ? 'Receita' : 'Despesa', brl(l.total)]);
    }
    ws.columns.forEach((c) => (c.width = 28));

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  /** Gera PDF do relatório. */
  toPdf(report: Report): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Finlytics', { continued: false });
      doc.fontSize(14).fillColor('#555').text(`Relatório ${report.period.label}`);
      doc.moveDown();
      doc.fillColor('#000').fontSize(11)
        .text(`Período: ${report.period.from} a ${report.period.to}`)
        .text(`Receitas: ${brl(report.totals.income)}`)
        .text(`Despesas: ${brl(report.totals.expense)}`)
        .text(`Saldo: ${brl(report.totals.balance)}`);
      doc.moveDown();

      doc.fontSize(12).text('Por categoria', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const l of report.lines) {
        const tipo = l.type === 'income' ? 'Receita' : 'Despesa';
        doc.text(`${l.categoryName}  —  ${tipo}  —  ${brl(l.total)}`);
      }
      if (report.lines.length === 0) doc.text('Sem lançamentos no período.');

      doc.end();
    });
  }
}
