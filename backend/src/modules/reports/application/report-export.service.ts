import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Report } from './reports.service';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

@Injectable()
export class ReportExportService {
  async toExcel(report: Report): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Finlytics';
    const ws = wb.addWorksheet('Relatório');

    ws.mergeCells('A1:C1');
    ws.getCell('A1').value = `Finlytics — Relatório ${report.periodo.rotulo}`;
    ws.getCell('A1').font = { bold: true, size: 14 };
    ws.addRow([]);
    ws.addRow(['Período', `${report.periodo.de} a ${report.periodo.ate}`]);
    ws.addRow(['Receitas', brl(report.totais.receitas)]);
    ws.addRow(['Despesas', brl(report.totais.despesas)]);
    ws.addRow(['Saldo', brl(report.totais.saldo)]);
    ws.addRow([]);

    const header = ws.addRow(['Categoria', 'Tipo', 'Total']);
    header.font = { bold: true };
    for (const l of report.linhas) {
      ws.addRow([l.categoriaNome, l.tipo === 'receita' ? 'Receita' : 'Despesa', brl(l.total)]);
    }
    ws.columns.forEach((c) => (c.width = 28));

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  toPdf(report: Report): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Finlytics');
      doc.fontSize(14).fillColor('#555').text(`Relatório ${report.periodo.rotulo}`);
      doc.moveDown();
      doc.fillColor('#000').fontSize(11)
        .text(`Período: ${report.periodo.de} a ${report.periodo.ate}`)
        .text(`Receitas: ${brl(report.totais.receitas)}`)
        .text(`Despesas: ${brl(report.totais.despesas)}`)
        .text(`Saldo: ${brl(report.totais.saldo)}`);
      doc.moveDown();

      doc.fontSize(12).text('Por categoria', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const l of report.linhas) {
        const tipo = l.tipo === 'receita' ? 'Receita' : 'Despesa';
        doc.text(`${l.categoriaNome}  —  ${tipo}  —  ${brl(l.total)}`);
      }
      if (report.linhas.length === 0) doc.text('Sem lançamentos no período.');
      doc.end();
    });
  }
}
