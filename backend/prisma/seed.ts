import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

// Categorias padrão sugeridas a cada novo usuário (criadas no registro).
export const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}> = [
  { name: 'Alimentação', type: 'expense', color: '#E5484D', icon: 'utensils' },
  { name: 'Transporte', type: 'expense', color: '#F5A623', icon: 'car' },
  { name: 'Saúde', type: 'expense', color: '#00B37E', icon: 'heart-pulse' },
  { name: 'Moradia', type: 'expense', color: '#1F6FEB', icon: 'home' },
  { name: 'Lazer', type: 'expense', color: '#A855F7', icon: 'gamepad-2' },
  { name: 'Educação', type: 'expense', color: '#0EA5E9', icon: 'graduation-cap' },
  { name: 'Investimentos', type: 'both', color: '#10B981', icon: 'trending-up' },
  { name: 'Salário', type: 'income', color: '#16A34A', icon: 'wallet' },
];

async function main() {
  console.log('Seed: categorias padrão definidas em DEFAULT_CATEGORIES.');
  console.log(`Total de categorias padrão: ${DEFAULT_CATEGORIES.length}`);
  // Em produção, as categorias padrão são criadas por usuário no fluxo de registro.
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
