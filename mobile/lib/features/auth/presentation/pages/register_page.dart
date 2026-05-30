import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/masks.dart';
import '../../../../core/utils/validators.dart';
import '../viewmodels/auth_viewmodel.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});
  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _form = GlobalKey<FormState>();
  final _nome = TextEditingController();
  final _sobrenome = TextEditingController();
  final _email = TextEditingController();
  final _telefone = TextEditingController();
  final _senha = TextEditingController();
  final _confirmar = TextEditingController();
  bool _obscure = true;
  bool _aceite = false;
  int _forca = 0;

  @override
  void initState() {
    super.initState();
    _senha.addListener(() => setState(() => _forca = Validators.forcaSenha(_senha.text)));
  }

  @override
  void dispose() {
    for (final c in [_nome, _sobrenome, _email, _telefone, _senha, _confirmar]) {
      c.dispose();
    }
    super.dispose();
  }

  ({String label, Color cor}) get _forcaInfo {
    if (_senha.text.isEmpty) return (label: '', cor: AppColors.mutedLight);
    if (_forca <= 1) return (label: 'Fraca', cor: AppColors.danger);
    if (_forca <= 3) return (label: 'Média', cor: AppColors.warning);
    return (label: 'Forte', cor: AppColors.secondary);
  }

  void _enviar() {
    if (!_form.currentState!.validate()) return;
    if (!_aceite) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('É necessário aceitar os Termos e a Política de Privacidade.')),
      );
      return;
    }
    ref.read(authViewModelProvider.notifier).register(
          nome: _nome.text.trim(),
          sobrenome: _sobrenome.text.trim(),
          email: _email.text.trim(),
          telefone: _telefone.text.trim().isEmpty ? null : _telefone.text.trim(),
          senha: _senha.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authViewModelProvider);
    ref.listen(authViewModelProvider, (_, next) {
      if (next is AuthSuccess) context.go('/onboarding');
      if (next is AuthError) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(next.mensagem)));
      }
    });

    final info = _forcaInfo;
    return Scaffold(
      appBar: AppBar(title: const Text('Criar conta')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _form,
          child: ListView(
            children: [
              Row(children: [
                Expanded(
                  child: TextFormField(
                    controller: _nome,
                    decoration: const InputDecoration(labelText: 'Nome'),
                    textInputAction: TextInputAction.next,
                    validator: Validators.nome,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _sobrenome,
                    decoration: const InputDecoration(labelText: 'Sobrenome'),
                    textInputAction: TextInputAction.next,
                    validator: Validators.nome,
                  ),
                ),
              ]),
              const SizedBox(height: 16),
              TextFormField(
                controller: _email,
                decoration: const InputDecoration(labelText: 'E-mail'),
                keyboardType: TextInputType.emailAddress,
                validator: Validators.email,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _telefone,
                decoration: const InputDecoration(labelText: 'Telefone', hintText: '(11) 99999-9999'),
                keyboardType: TextInputType.phone,
                inputFormatters: [BrPhoneFormatter()],
                validator: Validators.telefone,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _senha,
                obscureText: _obscure,
                decoration: InputDecoration(
                  labelText: 'Senha',
                  suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
                validator: Validators.password,
              ),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: _senha.text.isEmpty ? 0 : _forca / 4,
                    color: info.cor,
                    backgroundColor: AppColors.borderLight,
                  ),
                ),
                const SizedBox(width: 10),
                Text(info.label, style: TextStyle(color: info.cor, fontSize: 12, fontWeight: FontWeight.w600)),
              ]),
              const SizedBox(height: 16),
              TextFormField(
                controller: _confirmar,
                obscureText: _obscure,
                decoration: const InputDecoration(labelText: 'Confirmar senha'),
                validator: (v) => v != _senha.text ? 'As senhas não coincidem' : null,
              ),
              const SizedBox(height: 16),
              CheckboxListTile(
                value: _aceite,
                onChanged: (v) => setState(() => _aceite = v ?? false),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
                title: const Text('Aceito os Termos de Uso e a Política de Privacidade', style: TextStyle(fontSize: 13)),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: state is AuthLoading ? null : _enviar,
                child: state is AuthLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Criar conta'),
              ),
              TextButton(onPressed: () => context.go('/login'), child: const Text('Já tenho conta')),
            ],
          ),
        ),
      ),
    );
  }
}
