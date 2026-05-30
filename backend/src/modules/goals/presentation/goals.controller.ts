import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsPositive, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

class GoalDto {
  @IsString() title!: string;
  @IsNumber() @IsPositive() targetAmount!: number;
  @IsDateString() targetDate!: string;
}
class ContributionDto {
  @IsNumber() @IsPositive() amount!: number;
}

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser('id') userId: string) {
    const goals = await this.prisma.financialGoal.findMany({ where: { userId } });
    return goals.map((g) => this.withProgress(g));
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: GoalDto) {
    return this.prisma.financialGoal.create({
      data: { userId, title: dto.title, targetAmount: dto.targetAmount, targetDate: new Date(dto.targetDate) },
    });
  }

  @Post(':id/contributions')
  async contribute(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: ContributionDto) {
    const goal = await this.prisma.financialGoal.findFirst({ where: { id, userId } });
    if (!goal) return null;
    const current = Number(goal.currentAmount) + dto.amount;
    const completed = current >= Number(goal.targetAmount);
    await this.prisma.goalContribution.create({ data: { goalId: id, amount: dto.amount, date: new Date() } });
    return this.prisma.financialGoal.update({
      where: { id },
      data: { currentAmount: current, status: completed ? 'completed' : 'active' },
    });
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: Partial<GoalDto>) {
    const data: any = { ...dto };
    if (dto.targetDate) data.targetDate = new Date(dto.targetDate);
    return this.prisma.financialGoal.updateMany({ where: { id, userId }, data });
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.prisma.financialGoal.deleteMany({ where: { id, userId } });
  }

  private withProgress(g: any) {
    const target = Number(g.targetAmount);
    const current = Number(g.currentAmount);
    const months = Math.max(1, Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / (30 * 864e5)));
    return {
      ...g,
      progress: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
      suggestedMonthlyContribution: Math.max(0, (target - current) / months),
    };
  }
}
