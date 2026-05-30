import '../../domain/entities/auth_session.dart';
import '../../domain/entities/user.dart';

class AuthSessionModel {
  static AuthSession fromJson(Map<String, dynamic> json) {
    final u = json['usuario'] as Map<String, dynamic>;
    return AuthSession(
      tokenAcesso: json['tokenAcesso'] as String,
      tokenAtualizacao: json['tokenAtualizacao'] as String,
      usuario: User(
        id: u['id'] as String,
        nome: u['nome'] as String,
        email: u['email'] as String,
        plano: (u['plano'] as String?) ?? 'gratuito',
      ),
    );
  }
}
