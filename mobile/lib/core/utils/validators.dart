abstract class Validators {
  static String? email(String? v) {
    if (v == null || v.isEmpty) return 'Informe o e-mail';
    final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v);
    return ok ? null : 'E-mail inválido';
  }

  static String? password(String? v) {
    if (v == null || v.length < 8) return 'Mínimo de 8 caracteres';
    final forte = RegExp(r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$').hasMatch(v);
    return forte ? null : 'Use maiúscula, número e símbolo';
  }

  static String? required(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null;

  static String? nome(String? v) {
    final s = v?.trim() ?? '';
    if (s.length < 2) return 'Mínimo de 2 caracteres';
    if (s.length > 50) return 'Máximo de 50 caracteres';
    return null;
  }

  /// Telefone é opcional; se preenchido, precisa ter 10 ou 11 dígitos.
  static String? telefone(String? v) {
    if (v == null || v.trim().isEmpty) return null;
    final d = v.replaceAll(RegExp(r'\D'), '');
    return (d.length == 10 || d.length == 11) ? null : 'Telefone inválido';
  }

  /// Força da senha de 0 a 4 (comprimento, maiúscula, número, símbolo).
  static int forcaSenha(String s) {
    var x = 0;
    if (s.length >= 8) x++;
    if (RegExp(r'[A-Z]').hasMatch(s)) x++;
    if (RegExp(r'\d').hasMatch(s)) x++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(s)) x++;
    return x;
  }
}
