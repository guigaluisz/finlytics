abstract class Validators {
  static String? email(String? v) {
    if (v == null || v.isEmpty) return 'Informe o e-mail';
    final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v);
    return ok ? null : 'E-mail inválido';
  }

  static String? password(String? v) {
    if (v == null || v.length < 8) return 'Mínimo de 8 caracteres';
    final strong = RegExp(r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$').hasMatch(v);
    return strong ? null : 'Use maiúscula, número e símbolo';
  }

  static String? required(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null;
}
