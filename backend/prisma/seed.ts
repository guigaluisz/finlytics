import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES } from './default-categories';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Cria um usuário de demonstração com dados, pronto para login.
export async function main() {
  const email = 'lucas2@teste.com';
  const senhaHash = await argon2.hash('Senha@123', { type: argon2.argon2id });

  await prisma.user.deleteMany({ where: { email } }); // recria do zero (idempotente)

  const user = await prisma.user.create({
    data: {
      nome: 'Lucas',
      sobrenome: 'Demo',
      email,
      telefone: '(11) 99999-0000',
      senhaHash,
      assinatura: { create: { plano: 'premium_anual', status: 'ativa' } },
      categorias: {
        create: DEFAULT_CATEGORIES.map((c) => ({
          nome: c.nome, tipo: c.tipo, cor: c.cor, icone: c.icone, padrao: true,
        })),
      },
    },
  });
  const usuarioId = user.id;
  const cats = await prisma.category.findMany({ where: { usuarioId } });
  const cat = (nome: string) => cats.find((c) => c.nome === nome)?.id;

  const conta = await prisma.account.create({
    data: { usuarioId, nome: 'Conta Corrente', tipo: 'corrente', saldo: 8500 },
  });

  const hoje = new Date();
  const diaVencimento = (hoje.getDate() % 28) + 1;
  const card = await prisma.creditCard.create({
    data: { usuarioId, banco: 'Nubank', bandeira: 'Mastercard', limite: 5000, diaFechamento: 3, diaVencimento },
  });

  const d = (dia: number) => new Date(hoje.getFullYear(), hoje.getMonth(), dia);
  await prisma.transaction.createMany({
    data: [
      { usuarioId, tipo: 'receita', valor: 6200, categoriaId: cat('Salário'), contaId: conta.id, data: d(5), descricao: 'Salário' },
      { usuarioId, tipo: 'receita', valor: 800, categoriaId: cat('Investimentos'), contaId: conta.id, data: d(12), descricao: 'Freelance' },
      { usuarioId, tipo: 'despesa', valor: 1500, categoriaId: cat('Moradia'), contaId: conta.id, data: d(10), descricao: 'Aluguel' },
      { usuarioId, tipo: 'despesa', valor: 650, categoriaId: cat('Alimentação'), cartaoId: card.id, data: d(8), descricao: 'Supermercado' },
      { usuarioId, tipo: 'despesa', valor: 320, categoriaId: cat('Alimentação'), cartaoId: card.id, data: d(15), descricao: 'Restaurantes' },
      { usuarioId, tipo: 'despesa', valor: 210, categoriaId: cat('Transporte'), cartaoId: card.id, data: d(14), descricao: 'Combustível/Uber' },
      { usuarioId, tipo: 'despesa', valor: 180, categoriaId: cat('Lazer'), cartaoId: card.id, data: d(18), descricao: 'Cinema/Streaming' },
      { usuarioId, tipo: 'despesa', valor: 120, categoriaId: cat('Saúde'), contaId: conta.id, data: d(20), descricao: 'Farmácia' },
    ],
  });

  await prisma.budget.create({
    data: { usuarioId, categoriaId: cat('Alimentação')!, limiteMensal: 800, mes: hoje.getMonth() + 1, ano: hoje.getFullYear() },
  });

  const meta = await prisma.financialGoal.create({
    data: { usuarioId, titulo: 'Reserva de emergência', valorAlvo: 10000, valorAtual: 6800, dataAlvo: new Date(hoje.getFullYear() + 1, 0, 1) },
  });
  await prisma.goalContribution.create({ data: { metaId: meta.id, valor: 6800, data: d(1) } });
  await prisma.financialGoal.create({
    data: { usuarioId, titulo: 'Viagem', valorAlvo: 5000, valorAtual: 1000, dataAlvo: new Date(hoje.getFullYear(), hoje.getMonth() + 6, 1) },
  });

  await prisma.investment.createMany({
    data: [
      { usuarioId, tipoAtivo: 'tesouro', ticker: 'TESOURO SELIC 2029', quantidade: 10, precoMedio: 110.5 },
      { usuarioId, tipoAtivo: 'cdb', ticker: 'CDB BANCO X 110% CDI', quantidade: 1, precoMedio: 5000 },
      { usuarioId, tipoAtivo: 'fii', ticker: 'HGLG11', quantidade: 50, precoMedio: 158.2 },
      { usuarioId, tipoAtivo: 'acao', ticker: 'PETR4', quantidade: 100, precoMedio: 36.4 },
      { usuarioId, tipoAtivo: 'etf', ticker: 'IVVB11', quantidade: 20, precoMedio: 290.0 },
    ],
  });

  console.log('Seed OK! Usuário lucas2@teste.com / Senha@123 criado com dados de exemplo (Premium).');
}

if (require.main === module) {
  main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
}
