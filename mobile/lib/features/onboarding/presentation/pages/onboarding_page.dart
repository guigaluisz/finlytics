import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});
  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  int _step = 0;
  final _controller = PageController();

  static const _steps = [
    ('Qual seu objetivo?', ['Economizar', 'Investir', 'Sair das dívidas', 'Organizar finanças']),
    ('Sua faixa de renda', ['Até R\$ 2.000', 'R\$ 2.000 a 5.000', 'R\$ 5.000 a 10.000', 'Acima de R\$ 10.000']),
    ('Seu perfil financeiro', ['Conservador', 'Moderado', 'Arrojado']),
  ];

  @override
  Widget build(BuildContext context) {
    final (title, options) = _steps[_step];
    return Scaffold(
      appBar: AppBar(title: Text('Passo ${_step + 1}/${_steps.length}')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 24),
            ...options.map((o) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: OutlinedButton(
                    onPressed: () {
                      if (_step < _steps.length - 1) {
                        setState(() => _step++);
                      } else {
                        context.go('/dashboard');
                      }
                    },
                    child: Padding(padding: const EdgeInsets.all(8), child: Text(o)),
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
