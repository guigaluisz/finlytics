import 'user.dart';

class AuthSession {
  final String tokenAcesso;
  final String tokenAtualizacao;
  final User usuario;
  const AuthSession({required this.tokenAcesso, required this.tokenAtualizacao, required this.usuario});
}
