import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../auth/presentation/viewmodels/auth_viewmodel.dart';

// Converte valores que podem vir como número ou string (Prisma Decimal -> string).
double _n(dynamic v) => v is num ? v.toDouble() : double.tryParse(v?.toString() ?? '') ?? 0;
Dio _dio(Ref ref) => ref.watch(dioClientProvider).dio;

// ---------------- PROVIDERS ----------------
final resumoMensalProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final now = DateTime.now();
  final r = await _dio(ref).get('/relatorios/mensal', queryParameters: {'mes': now.month, 'ano': now.year});
  return Map<String, dynamic>.from(r.data as Map);
});
final patrimonioProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  try {
    final r = await _dio(ref).get('/patrimonio');
    return Map<String, dynamic>.from(r.data as Map);
  } catch (_) {
    return {};
  }
});
final categoriasProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final r = await _dio(ref).get('/categorias');
  return r.data as List;
});
final transacoesProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final r = await _dio(ref).get('/transacoes', queryParameters: {'limite': 50});
  return (r.data['itens'] as List);
});
final metasProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final r = await _dio(ref).get('/metas');
  return r.data as List;
});
final cartoesProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final r = await _dio(ref).get('/cartoes');
  return r.data as List;
});
final investimentosProvider = FutureProvider.autoDispose<dynamic>((ref) async {
  try {
    final r = await _dio(ref).get('/investimentos');
    return r.data;
  } catch (_) {
    return {'__forbidden': true};
  }
});

// ---------------- SHELL ----------------
class MainShell extends ConsumerStatefulWidget {
  const MainShell({super.key});
  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  int _index = 0;
  static const _titulos = ['Início', 'Transações', 'Metas', 'Cartões', 'Investimentos'];
  final _pages = const [DashboardTab(), TransacoesTab(), MetasTab(), CartoesTab(), InvestimentosTab()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titulos[_index]),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sair',
            onPressed: () async {
              await ref.read(authRepositoryProvider).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      floatingActionButton: _index == 1
          ? FloatingActionButton(
              onPressed: () => _novaTransacao(context, ref),
              child: const Icon(Icons.add),
            )
          : null,
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Início'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Transações'),
          NavigationDestination(icon: Icon(Icons.flag_outlined), selectedIcon: Icon(Icons.flag), label: 'Metas'),
          NavigationDestination(icon: Icon(Icons.credit_card_outlined), selectedIcon: Icon(Icons.credit_card), label: 'Cartões'),
          NavigationDestination(icon: Icon(Icons.trending_up_outlined), selectedIcon: Icon(Icons.trending_up), label: 'Invest.'),
        ],
      ),
    );
  }
}

// ---------------- DASHBOARD ----------------
class DashboardTab extends ConsumerWidget {
  const DashboardTab({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resumo = ref.watch(resumoMensalProvider);
    final patr = ref.watch(patrimonioProvider);
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(resumoMensalProvider);
        ref.invalidate(patrimonioProvider);
        await ref.read(resumoMensalProvider.future);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          resumo.when(
            loading: () => const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator())),
            error: (e, _) => Text('Erro ao carregar: $e'),
            data: (d) {
              final t = d['totais'] as Map<String, dynamic>;
              return Column(
                children: [
                  _KpiCard(label: 'Saldo do mês', value: _n(t['saldo'])),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(child: _KpiCard(label: 'Receitas', value: _n(t['receitas']), color: AppColors.secondary)),
                    const SizedBox(width: 12),
                    Expanded(child: _KpiCard(label: 'Despesas', value: _n(t['despesas']), color: AppColors.danger)),
                  ]),
                ],
              );
            },
          ),
          const SizedBox(height: 12),
          patr.when(
            loading: () => const SizedBox.shrink(),
            error: (e, _) => const SizedBox.shrink(),
            data: (d) => _KpiCard(
              label: 'Patrimônio',
              value: _n(d['patrimonioLiquido']),
              subtitle: d.containsKey('patrimonioLiquido') ? null : 'Disponível no Premium',
            ),
          ),
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final double value;
  final Color? color;
  final String? subtitle;
  const _KpiCard({required this.label, required this.value, this.color, this.subtitle});
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant)),
            const SizedBox(height: 6),
            Text(
              subtitle ?? Formatters.money(value),
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------- TRANSAÇÕES ----------------
class TransacoesTab extends ConsumerWidget {
  const TransacoesTab({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trx = ref.watch(transacoesProvider);
    return RefreshIndicator(
      onRefresh: () async { ref.invalidate(transacoesProvider); await ref.read(transacoesProvider.future); },
      child: trx.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (itens) => itens.isEmpty
            ? const Center(child: Text('Sem transações. Toque em + para adicionar.'))
            : ListView.separated(
                itemCount: itens.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (_, i) {
                  final t = itens[i] as Map<String, dynamic>;
                  final receita = t['tipo'] == 'receita';
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: (receita ? AppColors.secondary : AppColors.danger).withOpacity(.15),
                      child: Icon(receita ? Icons.arrow_downward : Icons.arrow_upward,
                          color: receita ? AppColors.secondary : AppColors.danger, size: 20),
                    ),
                    title: Text(t['descricao']?.toString() ?? '—'),
                    subtitle: Text(Formatters.date(DateTime.parse(t['data'].toString()))),
                    trailing: Text(
                      (receita ? '+ ' : '- ') + Formatters.money(_n(t['valor'])),
                      style: TextStyle(fontWeight: FontWeight.bold, color: receita ? AppColors.secondary : AppColors.danger),
                    ),
                  );
                },
              ),
      ),
    );
  }
}

Future<void> _novaTransacao(BuildContext context, WidgetRef ref) async {
  final cats = await ref.read(categoriasProvider.future);
  if (!context.mounted) return;
  String tipo = 'despesa';
  String? categoriaId = cats.isNotEmpty ? cats.first['id'] as String : null;
  final valorCtrl = TextEditingController();
  final descCtrl = TextEditingController();

  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (ctx) => Padding(
      padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(ctx).viewInsets.bottom + 16),
      child: StatefulBuilder(
        builder: (ctx, setState) => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Nova transação', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'despesa', label: Text('Despesa')),
                ButtonSegment(value: 'receita', label: Text('Receita')),
              ],
              selected: {tipo},
              onSelectionChanged: (s) => setState(() => tipo = s.first),
            ),
            const SizedBox(height: 12),
            TextField(controller: valorCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Valor (R\$)')),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: categoriaId,
              decoration: const InputDecoration(labelText: 'Categoria'),
              items: cats.map<DropdownMenuItem<String>>((c) => DropdownMenuItem(value: c['id'] as String, child: Text(c['nome'].toString()))).toList(),
              onChanged: (v) => categoriaId = v,
            ),
            const SizedBox(height: 12),
            TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Descrição')),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () async {
                final valor = double.tryParse(valorCtrl.text.replaceAll(',', '.')) ?? 0;
                if (valor <= 0) return;
                try {
                  await ref.read(dioClientProvider).dio.post('/transacoes', data: {
                    'tipo': tipo,
                    'valor': valor,
                    'categoriaId': categoriaId,
                    'data': DateTime.now().toIso8601String().substring(0, 10),
                    'descricao': descCtrl.text,
                  });
                  ref.invalidate(transacoesProvider);
                  ref.invalidate(resumoMensalProvider);
                  if (ctx.mounted) Navigator.pop(ctx);
                } catch (e) {
                  if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Erro: $e')));
                }
              },
              child: const Text('Salvar'),
            ),
          ],
        ),
      ),
    ),
  );
}

// ---------------- METAS ----------------
class MetasTab extends ConsumerWidget {
  const MetasTab({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metas = ref.watch(metasProvider);
    return RefreshIndicator(
      onRefresh: () async { ref.invalidate(metasProvider); await ref.read(metasProvider.future); },
      child: metas.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (itens) => itens.isEmpty
            ? const Center(child: Text('Nenhuma meta.'))
            : ListView(
                padding: const EdgeInsets.all(16),
                children: itens.map((m) {
                  final prog = (_n(m['progresso']) / 100).clamp(0.0, 1.0);
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                            Text(m['titulo'].toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text('${_n(m['progresso']).toStringAsFixed(0)}%'),
                          ]),
                          const SizedBox(height: 8),
                          LinearProgressIndicator(value: prog),
                          const SizedBox(height: 8),
                          Text('${Formatters.money(_n(m['valorAtual']))} / ${Formatters.money(_n(m['valorAlvo']))}',
                              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant)),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
      ),
    );
  }
}

// ---------------- CARTÕES ----------------
class CartoesTab extends ConsumerWidget {
  const CartoesTab({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartoes = ref.watch(cartoesProvider);
    return RefreshIndicator(
      onRefresh: () async { ref.invalidate(cartoesProvider); await ref.read(cartoesProvider.future); },
      child: cartoes.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (itens) => itens.isEmpty
            ? const Center(child: Text('Nenhum cartão.'))
            : ListView(
                padding: const EdgeInsets.all(16),
                children: itens.map((c) => Card(
                      child: ListTile(
                        leading: const Icon(Icons.credit_card),
                        title: Text('${c['banco']} · ${c['bandeira']}'),
                        subtitle: Text('Limite ${Formatters.money(_n(c['limite']))} · Fecha dia ${c['diaFechamento']} · Vence dia ${c['diaVencimento']}'),
                      ),
                    )).toList(),
              ),
      ),
    );
  }
}

// ---------------- INVESTIMENTOS ----------------
class InvestimentosTab extends ConsumerWidget {
  const InvestimentosTab({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inv = ref.watch(investimentosProvider);
    return RefreshIndicator(
      onRefresh: () async { ref.invalidate(investimentosProvider); await ref.read(investimentosProvider.future); },
      child: inv.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (data) {
          if (data is Map && data['__forbidden'] == true) {
            return const Center(child: Padding(padding: EdgeInsets.all(24), child: Text('Investimentos disponíveis no plano Premium.')));
          }
          final itens = data as List;
          if (itens.isEmpty) return const Center(child: Text('Nenhum investimento.'));
          return ListView(
            padding: const EdgeInsets.all(16),
            children: itens.map((i) {
              final lucro = _n(i['lucro']);
              final pos = lucro >= 0;
              return Card(
                child: ListTile(
                  title: Text(i['ticker'].toString()),
                  subtitle: Text('${i['tipoAtivo']} · ${i['quantidade']} cotas'),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(Formatters.money(lucro), style: TextStyle(fontWeight: FontWeight.bold, color: pos ? AppColors.secondary : AppColors.danger)),
                      Text('${_n(i['rentabilidade']).toStringAsFixed(1)}%', style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant, fontSize: 12)),
                    ],
                  ),
                ),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
