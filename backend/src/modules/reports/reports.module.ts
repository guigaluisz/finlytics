import { Module } from '@nestjs/common';
import { ReportsController } from './presentation/reports.controller';
import { ReportsService } from './application/reports.service';
import { ReportExportService } from './application/report-export.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportExportService],
})
export class ReportsModule {}
