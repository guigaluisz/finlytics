import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/utils/validators.dart';
import '../viewmodels/auth_viewmodel.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});
  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authViewModelProvider);
    ref.listen(authViewModelProvider, (_, next) {
      if (next is AuthSuccess) context.go('/onboarding');
      if (next is AuthError) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(next.message)));
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Criar conta')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _form,
          child: ListView(
            children: [
              TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Nome'), validator: Validators.required),
              const SizedBox(height: 16),
              TextFormField(controller: _email, decoration: const InputDecoration(labelText: 'E-mail'), validator: Validators.email),
              const SizedBox(height: 16),
              TextFormField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Senha'), validator: Validators.password),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: state is AuthLoading ? null : () {
                  if (_form.currentState!.validate()) {
                    ref.read(authViewModelProvider.notifier).register(
                      name: _name.text.trim(), email: _email.text.trim(), password: _password.text,
                    );
                  }
                },
                child: const Text('Criar conta'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
