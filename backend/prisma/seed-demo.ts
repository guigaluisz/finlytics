/**
 * Popula um usuário existente com dados de demonstração:
 * conta, transações do mês, cartão com gastos, orçamento (estourado),
 * metas e investimentos. Também torna o usuário Premium.
 *
 * Uso:  npx ts-node prisma/seed-demo.ts lucas2@teste.com
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? 'lucas2@teste.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Usuário ${email} não encontrado. Cadastre-o primeiro no /v1/auth/register.`);
    process.exit(1);
  }
  const userId = user.id;
  console.log(`Populando dados para ${email} (${userId})...`);

  // limpa dados demo anteriores
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.creditCard.deleteMany({ where: { userId } });
  await prisma.budget.deleteMany({ where: { userId } });
  await prisma.goalContribution.deleteMany({ where: { goal: { userId } } });
  await prisma.financialGoal.deleteMany({ where: { userId } });
  await prisma.investment.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });
  await prisma.alert.deleteMany({ where: { userId } });

  // Premium (para liberar investimentos e patrimônio)
  await prisma.subscription.update({ where: { userId }, data: { plan: 'premium_annual', status: 'active' } });

  // Conta com saldo
  const account = await prisma.account.create({
    data: { userId, name: 'Conta Corrente', type: 'checking', balance: 8500 },
  });

  // Categorias já existem (criadas no registro)
  const cats = await prisma.category.findMany({ where: { userId } });
  const cat = (name: string) => cats.find((c) => c.name === name)?.id;

  // Cartão com vencimento amanhã (gera alerta) + gastos
  const today = new Date();
  const dueDay = ((today.getDate() % 28) + 1);
  const card = await prisma.creditCard.create({
    data: { userId, bank: 'Nubank', brand: 'Mastercard', creditLimit: 5000, closingDay: 3, dueDay },
  });

  const d = (day: number) => new Date(today.getFullYear(), today.getMonth(), day);
  await prisma.transaction.createMany({
    data: [
      { userId, type: 'income', value: 6200, categoryId: cat('Salário'), accountId: account.id, date: d(5), description: 'Salário' },
      { userId, type: 'income', value: 800, categoryId: cat('Investimentos'), accountId: account.id, date: d(12), description: 'Freelance' },
      { userId, type: 'expense', value: 1500, categoryId: cat('Moradia'), accountId: account.id, date: d(10), description: 'Aluguel' },
      { userId, type: 'expense', value: 650, categoryId: cat('Alimentação'), creditCardId: card.id, date: d(8), description: 'Supermercado' },
      { userId, type: 'expense', value: 320, categoryId: cat('Alimentação'), creditCardId: card.id, date: d(15), description: 'Restaurantes' },
      { userId, type: 'expense', value: 210, categoryId: cat('Transporte'), creditCardId: card.id, date: d(14), description: 'Combustível/Uber' },
      { userId, type: 'expense', value: 180, categoryId: cat('Lazer'), creditCardId: card.id, date: d(18), description: 'Cinema/Streaming' },
      { userId, type: 'expense', value: 120, categoryId: cat('Saúde'), accountId: account.id, date: d(20), description: 'Farmácia' },
    ],
  });

  // Orçamento de Alimentação propositalmente abaixo do gasto (650+320=970) -> alerta
  await prisma.budget.create({
    data: { userId, categoryId: cat('Alimentação')!, monthlyLimit: 800, month: today.getMonth() + 1, year: today.getFullYear() },
  });

  // Metas
  const reserva = await prisma.financialGoal.create({
    data: { userId, title: 'Reserva de emergência', targetAmount: 10000, currentAmount: 6800, targetDate: new Date(today.getFullYear() + 1, 0, 1) },
  });
  await prisma.goalContribution.create({ data: { goalId: reserva.id, amount: 6800, date: d(1) } });
  await prisma.financialGoal.create({
    data: { userId, title: 'Viagem', targetAmount: 5000, currentAmount: 1000, targetDate: new Date(today.getFullYear(), today.getMonth() + 6, 1) },
  });

  // Investimentos (várias classes)
  await prisma.investment.createMany({
    data: [
      { userId, assetType: 'tesouro', ticker: 'TESOURO SELIC 2029', quantity: 10, averagePrice: 110.5 },
      { userId, assetType: 'cdb', ticker: 'CDB BANCO X 110% CDI', quantity: 1, averagePrice: 5000 },
      { userId, assetType: 'fii', ticker: 'HGLG11', quantity: 50, averagePrice: 158.2 },
      { userId, assetType: 'stock', ticker: 'PETR4', quantity: 100, averagePrice: 36.4 },
      { userId, assetType: 'etf', ticker: 'IVVB11', quantity: 20, averagePrice: 290.0 },
    ],
  });

  console.log('OK! Dados demo criados.');
  console.log('Dica: faça LOGIN de novo para o token vir com plano premium, depois rode os jobs (quotes/alerts/networth).');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
