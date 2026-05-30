import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/viewmodels/auth_viewmodel.dart';

class OnboardingPage extends ConsumerStatefulWidget {
  const OnboardingPage({super.key});
  @override
  ConsumerState<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends ConsumerState<OnboardingPage> {
  int _step = 0;
  bool _salvando = false;
  final List<String?> _valores = [null, null, null];

  static const List<(String, List<(String, String)>)> _steps = [
    ('Qual seu objetivo?', [
      ('Economizar', 'economizar'),
      ('Investir', 'investir'),
      ('Sair das dívidas', 'sair_dividas'),
      ('Organizar finanças', 'organizar'),
    ]),
    ('Sua faixa de renda', [
      ('Até R\$ 2.000', 'ate_2000'),
      ('R\$ 2.000 a R\$ 5.000', '2000_5000'),
      ('R\$ 5.000 a R\$ 10.000', '5000_10000'),
      ('Acima de R\$ 10.000', 'acima_10000'),
    ]),
    ('Seu perfil financeiro', [
      ('Conservador', 'conservador'),
      ('Moderado', 'moderado'),
      ('Arrojado', 'arrojado'),
    ]),
  ];

  Future<void> _selecionar(String valor) async {
    _valores[_step] = valor;
    if (_step < _steps.length - 1) {
      setState(() => _step++);
    } else {
      await _salvar();
    }
  }

  Future<void> _salvar() async {
    setState(() => _salvando = true);
    try {
      await ref.read(dioClientProvider).dio.patch('/eu/onboarding', data: {
        'objetivo': _valores[0],
        'faixaRenda': _valores[1],
        'perfilRisco': _valores[2],
      });
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Não foi possível salvar o perfil: ${e.message}')));
      }
    } finally {
      if (mounted) {
        setState(() => _salvando = false);
        context.go('/dashboard');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final (titulo, opcoes) = _steps[_step];
    return Scaffold(
      appBar: AppBar(
        title: Text('Passo ${_step + 1}/${_steps.length}'),
        leading: _step > 0
            ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => setState(() => _step--))
            : null,
      ),
      body: _salvando
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  LinearProgressIndicator(value: (_step + 1) / _steps.length),
                  const SizedBox(height: 24),
                  Text(titulo, style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 24),
                  ...opcoes.map((o) {
                    final selecionado = _valores[_step] == o.$2;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.all(18),
                          side: BorderSide(
                            color: selecionado ? Theme.of(context).colorScheme.primary : Theme.of(context).dividerColor,
                            width: selecionado ? 2 : 1,
                          ),
                        ),
                        onPressed: () => _selecionar(o.$2),
                        child: Align(alignment: Alignment.centerLeft, child: Text(o.$1)),
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}
