import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/utils/validators.dart';
import '../viewmodels/auth_viewmodel.dart';

class ResetPasswordPage extends ConsumerStatefulWidget {
  const ResetPasswordPage({super.key});
  @override
  ConsumerState<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends ConsumerState<ResetPasswordPage> {
  final _form = GlobalKey<FormState>();
  final _token = TextEditingController();
  final _senha = TextEditingController();
  final _confirmar = TextEditingController();
  bool _loading = false;

  Future<void> _redefinir() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(dioClientProvider).dio.post('/autenticacao/redefinir-senha',
          data: {'token': _token.text.trim(), 'senha': _senha.text});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Senha redefinida com sucesso! Faça login.')));
      context.go('/login');
    } on DioException catch (e) {
      final msg = e.response?.statusCode == 401 ? 'Código inválido ou expirado' : (e.message ?? 'Erro');
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Redefinir senha')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _form,
          child: ListView(
            children: [
              TextFormField(
                controller: _token,
                decoration: const InputDecoration(labelText: 'Código recebido'),
                validator: Validators.required,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _senha,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Nova senha'),
                validator: Validators.password,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _confirmar,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Confirmar nova senha'),
                validator: (v) => v != _senha.text ? 'As senhas não coincidem' : null,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _loading ? null : _redefinir,
                child: _loading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Redefinir senha'),
              ),
              TextButton(onPressed: () => context.go('/login'), child: const Text('Voltar ao login')),
            ],
          ),
        ),
      ),
    );
  }
}
