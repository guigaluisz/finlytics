import '../../domain/entities/auth_session.dart';
import '../../domain/entities/user.dart';

class AuthSessionModel {
  static AuthSession fromJson(Map<String, dynamic> json) {
    final u = json['user'] as Map<String, dynamic>;
    return AuthSession(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      user: User(
        id: u['id'] as String,
        name: u['name'] as String,
        email: u['email'] as String,
        plan: (u['plan'] as String?) ?? 'free',
      ),
    );
  }
}
