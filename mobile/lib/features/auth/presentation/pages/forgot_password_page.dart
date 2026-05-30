import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/utils/validators.dart';
import '../viewmodels/auth_viewmodel.dart';

class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});
  @override
  ConsumerState<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _form = GlobalKey<FormState>();
  final _email = TextEditingController();
  bool _loading = false;
  bool _enviado = false;

  Future<void> _enviar() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(dioClientProvider).dio.post('/autenticacao/esqueci-senha', data: {'email': _email.text.trim()});
      setState(() => _enviado = true);
    } on DioException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message ?? 'Erro')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recuperar senha')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _form,
          child: ListView(
            children: [
              const Text('Informe seu e-mail e enviaremos as instruções para redefinir sua senha.'),
              const SizedBox(height: 20),
              TextFormField(
                controller: _email,
                decoration: const InputDecoration(labelText: 'E-mail'),
                keyboardType: TextInputType.emailAddress,
                validator: Validators.email,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _loading ? null : _enviar,
                child: _loading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Enviar instruções'),
              ),
              if (_enviado) ...[
                const SizedBox(height: 24),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Se existir uma conta com esse e-mail, enviamos um código.'),
                        const SizedBox(height: 8),
                        Text(
                          'Em desenvolvimento, o código aparece no console do backend (linha "[DEV] E-mail de reset ... token: ...").',
                          style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => context.go('/reset-password'),
                  child: const Text('Já tenho o código — redefinir senha'),
                ),
              ],
              TextButton(onPressed: () => context.go('/login'), child: const Text('Voltar ao login')),
            ],
          ),
        ),
      ),
    );
  }
}
