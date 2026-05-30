import { CategoryType } from '@prisma/client';

// Categorias padrão criadas para cada novo usuário no registro.
export const DEFAULT_CATEGORIES: Array<{ nome: string; tipo: CategoryType; cor: string; icone: string }> = [
  { nome: 'Alimentação', tipo: 'despesa', cor: '#E5484D', icone: 'utensils' },
  { nome: 'Transporte', tipo: 'despesa', cor: '#F5A623', icone: 'car' },
  { nome: 'Saúde', tipo: 'despesa', cor: '#00B37E', icone: 'heart-pulse' },
  { nome: 'Moradia', tipo: 'despesa', cor: '#1F6FEB', icone: 'home' },
  { nome: 'Lazer', tipo: 'despesa', cor: '#A855F7', icone: 'gamepad-2' },
  { nome: 'Educação', tipo: 'despesa', cor: '#0EA5E9', icone: 'graduation-cap' },
  { nome: 'Investimentos', tipo: 'ambos', cor: '#10B981', icone: 'trending-up' },
  { nome: 'Salário', tipo: 'receita', cor: '#16A34A', icone: 'wallet' },
];
